const nanocurrency = require('nanocurrency');
const axios = require('axios');
const config = require('config');

function main() {
  var help_str = "1). Create a new wallet and save the seed to seed.txt:\n";
  help_str += "    node wallet.js new > seed.txt\n";
  help_str += "2). Show the address of a wallet:\n";
  help_str += "    cat seed.txt | node wallet.js address\n";
  help_str += "3). Check the balance and create receive blocks:\n";
  help_str += "    cat seed.txt | node wallet.js balance\n";
  help_str += "4). Send 1 raw nano to another address:\n";
  help_str += "    cat seed.txt | node wallet.js send <second_wallet_address> 1";
  help_str += "5). Show private key if you want import to other wallet software:\n";
  help_str += "    cat seed.txt | node wallet.js privatekey";

  var myArgs = process.argv.slice(2);
  if (myArgs.length == 0) {
    console.log(help_str);
    return;
  }

  switch (myArgs[0]) {
    case 'new':
      new_wallet();
      break;
    case 'address':
    case 'balance':
    case 'send':
    case 'privatekey':
      const stdin = process.stdin;
      var data = '';
      stdin.on('data', function (chunk) {
        data += chunk;
      });
      stdin.on('end', function () {
        var seed = data.toString().replace(/[\n\r]+/g, '');
        if (myArgs[0] == 'address') {
          return show_address(seed);
        }
        if (myArgs[0] == 'privatekey') {
          return show_privatekey(seed);
        }
        if (myArgs[0] == 'balance') {
          return check_balance(seed);
        }
        if (myArgs[0] == 'send') {
          if (myArgs.length < 3) {
            console.log('help');
            return;
          }
          return send_to(seed, myArgs[1], myArgs[2]);
        }
      });

      break;
    default:
      console.log('help');
  }
}

function show_address(seed) {
  var keys = get_keys_from_seed(seed);
  console.log(keys.address);
}

function show_privatekey(seed) {
  var keys = get_keys_from_seed(seed);
  console.log(keys.private_key);
}

async function check_balance(seed) {
  const previous = "0000000000000000000000000000000000000000000000000000000000000000";
  var address = get_keys_from_seed(seed);
  var request_data = { action: "account_info", account: address.address, representative: "true" };
  var response = await axios.post(config.node_url, request_data);
  var balance = BigInt(0);
  var work_hash = address.public_key; // hash is public key of the account, for first new account
  if ('frontier' in response.data) {
    previous = response.data.frontier;
    balance = BigInt(response.data.balance);
    work_hash = previous;
  }

  var is_new_account = false;
  if ('error' in response.data &&
    response.data.error == 'Account not found') {
    is_new_account = true;
  }

  while (true) {
    //(1) get pending
    request_data = { action: "pending", account: address.address, include_only_confirmed: "true", source: "true" };
    response = await axios.post(config.node_url, request_data);
    const blocks = response.data.blocks;

    // No pending blocks
    if (blocks == '') {
      if (is_new_account && balance == 0) {
        console.log("The account " + address.address + " has not been opened yet. Please send some nano to it first.");
      } else {
        console.log("The account " + address.address + " balance is " + balance);
      }
      return;
    }

    var block_hash = Object.keys(blocks)[0];
    balance += BigInt(blocks[block_hash].amount);
    // convert to string
    balance = balance.toString();
    // console.log(balance);

    //(2) generate work
    request_data = { action: "work_generate", difficulty: config.receive_work_threshold, hash: work_hash };
    response = await axios.post(config.node_url, request_data);

    // (3) create block
    const block = nanocurrency.createBlock(address.private_key, {
      balance: balance,
      link: block_hash,
      previous: previous,
      representative: config.representive,
      work: response.data.work,
    });

    //(4) process work
    request_data = { action: "process", json_block: "true", subtype: "receive", "block": block.block };
    //console.log(request_data);
    response = await axios.post(config.node_url, request_data);
    //console.log(response.data)
    console.log("flush pending receive for " + address.address + ". Now balance is " + balance);
  }
}

async function send_to(seed, to_address, amount) {
  var from_address = get_keys_from_seed(seed);
   //(1) get froniter
   var request_data = {action : "account_info",account: from_address.address , representative : "true"};
   var response = await axios.post(config.node_url, request_data);
   const frontier = response.data.frontier

   //(2) get frontier block info
   request_data = {action : "block_info",json_block: "true",hash: frontier }
   response = await  axios.post(config.node_url, request_data);
   const block_info = response.data;

   var balance = BigInt(block_info.balance) - BigInt(amount);
   //console.log(block_info.balance, amount, balance); return;
   //(3) generate work
   request_data = {action : "work_generate",difficulty: config.send_work_threshold,  hash: frontier}
   response = await  axios.post(config.node_url, request_data);

   //(4) create a block and sign
   const block = nanocurrency.createBlock(from_address.private_key, {
            balance: balance.toString(),
            link: nanocurrency.derivePublicKey(to_address),
            previous: frontier,
            representative: config.representive,
            work: response.data.work,
   });

   //(5) process work
   request_data = {action : "process", json_block: "true", subtype : "send", "block": block.block };
   response = await  axios.post(config.node_url, request_data);
   console.log("send " + amount + " raw nano balance(" + balance + ") from " + from_address.address + " to " + to_address);

}

function new_wallet() {
  nanocurrency.generateSeed().then(seed => {
    console.log(seed);
  });
}

function get_keys_from_seed(seed) {
  const private_key = nanocurrency.deriveSecretKey(seed, 0);
  const public_key = nanocurrency.derivePublicKey(private_key);
  const address = nanocurrency.deriveAddress(public_key);
  return { "seed": seed, "private_key": private_key, "public_key": public_key, "address": address };
}


main();

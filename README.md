[Nano](https://nano.org/) is a fee-less, fast cryptocurrency. This is a command line Nano wallet using node.js.

# Install
```
npm install
```
# How to use
* Create a new wallet and save the seed to seed.txt
```
node wallet.js new > seed.txt
```

* Show the address of the wallet just created
```
cat seed.txt | node wallet.js address
```
  *xrb_14w1astamck71wkfrcuumi1xyewpmomqxb6spiom64odi91um9ifcsjej4ns*

* Check the balance will give the error as the account has not been opened yet
```
cat seed.txt | node wallet.js balance
```
  *The account xrb_14w1astamck71wkfrcuumi1xyewpmomqxb6spiom64odi91um9ifcsjej4ns has not been opened yet. Please send some nano to it first.*

* Send some nano to the address from [faucet](https://nano-faucet.org/) or [the faucet game](https://luckynano.com/).  

* Check the balance again. It will create receive blocks for pending transactions
```
cat seed.txt | node wallet.js balance
```
  *flush pending receive for xrb_14w1astamck71wkfrcuumi1xyewpmomqxb6spiom64odi91um9ifcsjej4ns. Now balance is 1. The account xrb_14w1astamck71wkfrcuumi1xyewpmomqxb6spiom64odi91um9ifcsjej4ns balance is 1*

* You can also check the balance at [Nano crawler](https://nanocrawler.cc/).

* Create another wallet to receive the nano from the first wallet
```
node wallet.js new > seed1.txt
cat seed1.txt | node wallet.js address
```

* Transfer 1 raw nano from the first wallet to the second one
```
cat seed.txt | node wallet.js send <second_wallet_address> 1
```

* Check the balance of second wallet to create receive blocks
```
cat seed1.txt | node wallet.js balance
```
# Donation

Send some nano to nano_1aipxhoq65mrdrk9yzrb7kp6ah9qz5iedhse5uk4expworbkfbtmwskb7xkg
![Alt text](/config/qr_code.png?raw=true "nano_1aipxhoq65mrdrk9yzrb7kp6ah9qz5iedhse5uk4expworbkfbtmwskb7xkg")


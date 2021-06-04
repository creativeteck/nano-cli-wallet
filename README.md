A simple nano cryptocurrency command line based wallet

# Install
```
npm install
```

# Create a new wallet and save the seed to seed.txt
```
node wallet.js new > seed.txt
```

# Show the address of the wallet just created
```
cat seed.txt | node wallet.js address
```

# Use above address to get free nano from [faucet](https://nano-faucet.org/) or [play game](https://luckynano.com/)  
If you check the address at [Nano crawler](https://nanocrawler.cc/), the account has not open

# Check the balance which will also create receive blocks for pending transactions
```
cat seed.txt | node wallet.js balance
```
Now you can see the balance at [Nano crawler](https://nanocrawler.cc/).

# Create another wallet to receive the nano from the first wallet
```
node wallet.js new > seed1.txt
cat seed1.txt | node wallet.js address
```

# Transfer 1 raw nano from the first wallet to the second one
```
cat seed.txt | node wallet.js send <second_wallet_address> 1
```
# Check the balance of second wallet to create receive blocks
```
cat seed1.txt | node wallet.js balance
```
# Donation

Send some nano to nano_1aipxhoq65mrdrk9yzrb7kp6ah9qz5iedhse5uk4expworbkfbtmwskb7xkg


//  You start by importing IProvider type from web3auth/base for our typescript
import { IProvider } from "@web3auth/base";

// You import some function which we will use to send input to xrp ledger 
import { convertStringToHex, Payment, xrpToDrops } from "xrpl"

// define  our class where we will put all our requests

export default class XrplRPC {
    // Declaring a private provider variable of type IProvider}
    private provider: IProvider;

     //You define a Constructor that initializes the provider variable with the provided argument
     constructor (provider: IProvider) {
        this.provider = provider
     }

     // Method to get accounts associated with the provider
     getAccounts = async (): Promise<any> => {
        try {
            // Request the accounts using the provider
            const accounts = await this.provider.request<never, string[]>({
                method: "xrpl_getAccounts", // Specify the method to get accounts
            });
            console.log(accounts, "accounts"); // Log the accounts for debugging purposes
            
            if (accounts) { // Check if any accounts were returned
                // Request account info for the first account in the list
                const accInfo = await this.provider.request({
                    method: "account_info", // Specify the method to get account info
                    params: [
                        {
                            account: accounts[0], // Use the first account
                            strict: false, // Non-strict mode allows for more lenient account info retrieval
                            ledger_index: "current", // Use the current ledger index
                            queue: true, // Include queued transactions
                        },
                    ],
                });
                return accInfo; // Return the account info
            } else {
                return "No account found, please report issues"; // Return an error message if no accounts are found
            }
        } catch (error) { // Handle any errors that occur
            console.error("Error", error); // Log the error
            return error; // Return the error
        }
     };
     

     // Method to get the balance of the first account
    getBalance = async (): Promise<any> => {
        try {
            // Request the accounts using the provider
            const accounts = await this.provider.request<string[], never>({
                method: "xrpl_getAccounts", // Specify the method to get accounts
            });

            if (accounts) { // Check if any accounts were returned
                // Request account info for the first account in the list
                const accInfo = (await this.provider.request({
                    method: "account_info", // Specify the method to get account info
                    params: [
                        {
                            account: accounts[0], // Use the first account
                            strict: true, // Strict mode ensures accurate account info
                            ledger_index: "current", // Use the current ledger index
                            queue: true, // Include queued transactions
                        },
                    ],
                })) as Record<string, Record<string, string>>;
                return accInfo.account_data?.Balance; // Return the account balance
            } else {
                return "No accounts found, please report this issue."; // Return an error message if no accounts are found
            }
        } catch (error) { // Handle any errors that occur
            console.error("Error", error); // Log the error
            return error; // Return the error
        }
    };


    // Method to get the address of the first account
    getAccountAddress = async (): Promise<any> => {
        try {
            // Request the accounts using the provider
            const accounts = await this.provider.request<string[], never>({
                method: "xrpl_getAccounts", // Specify the method to get accounts
            });

            if (accounts) { // Check if any accounts were returned
                // Request account info for the first account in the list
                const accInfo = (await this.provider.request({
                    method: "account_info", // Specify the method to get account info
                    params: [
                        {
                            account: accounts[0], // Use the first account
                            strict: true, // Strict mode ensures accurate account info
                            ledger_index: "current", // Use the current ledger index
                            queue: true, // Include queued transactions
                        },
                    ],
                })) as Record<string, Record<string, string>>;
                return accInfo?.account; // Return the account address
            } else {
                return "No accounts found, please report this issue."; // Return an error message if no accounts are found
            }
        } catch (error) { // Handle any errors that occur
            console.error("Error", error); // Log the error
            return error; // Return the error
        }
    }

    // Method to sign a message
    signMessage = async (): Promise<any> => {
        try {
            const msg = "Hello world this is tutorial on XRPL by Amityclev"; // Define the message to sign
            const hexMsg = convertStringToHex(msg); // Convert the message to a hexadecimal string
            const txSign = await this.provider.request<{ signature: string }, never>({
                method: "xrpl_signMessage", // Specify the method to sign a message
                params: {
                    signature: hexMsg, // Provide the hexadecimal message to be signed
                },
            });
            return txSign; // Return the signed message
        } catch (error) { // Handle any errors that occur
            console.log("error", error); // Log the error
            return error; // Return the error
        }
    };

    // Method to sign and send a transaction
    signAndSendTransaction = async (): Promise<any> => {
        try {
            // Request the accounts using the provider
            const accounts = await this.provider.request<never, string[]>({
                method: "xrpl_getAccounts", // Specify the method to get accounts
            });

            if (accounts && accounts.length > 0) { // Check if any accounts were returned and the list is not empty
                // Create the payment transaction object
                const tx: Payment = {
                    TransactionType: "Payment", // Specify the transaction type
                    Account: accounts[0] as string, // Use the first account as the sender
                    Amount: xrpToDrops(50), // Specify the amount to send, converting XRP to drops
                    Destination: "rM9uB4xzDadhBTNG17KHmn3DLdenZmJwTy", // Specify the destination address
                };
                // Request to submit the transaction
                const txSign = await this.provider.request({
                    method: "xrpl_submitTransaction", // Specify the method to submit a transaction
                    params: {
                        transaction: tx, // Provide the transaction object
                    },
                });
                return txSign; // Return the transaction signature
            } else {
                return "failed to fetch accounts"; // Return an error message if no accounts are found
            }
        } catch (error) { // Handle any errors that occur
            console.log("error", error); // Log the error
            return error; // Return the error
        }
    };

}
// 'use client' ensures that the following code is executed on the client side
'use client'
// Import necessary modules and components from various packages
import { XrplPrivateKeyProvider } from "@web3auth/xrpl-provider"; // Provides a private key provider for XRPL
import { Web3Auth } from "@web3auth/modal"; // Main Web3Auth module for authentication
import { getXrplChainConfig } from "@web3auth/base"; // Utility function to get XRPL chain configuration
import { CHAIN_NAMESPACES, UX_MODE, WEB3AUTH_NETWORK, IProvider } from "@web3auth/base"; // Various constants and interfaces for Web3Auth
import RPC from "../utils/xrpLRPC"; // Custom RPC class for XRPL interactions
import { OpenloginAdapter } from "@web3auth/openlogin-adapter"; // Adapter for Openlogin
import React, { useEffect, useState } from 'react'; // React hooks for managing state and side effects

// Client ID for Web3Auth which you can get from the web3 auth dashboard https://dashboard.web3auth.io/
const clientId = "BKVW17ohm6Mt-A6O_A633ECD5fOYUEkyOwmU5sdoEhtQFj0PiS28wxLO5DkmbqaAEsCgsd_BzqxhYjabDihcjLc";

// Main component for Web3 authentication
const Web3Authentication = () => {
  // Define state variables
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null); // State for Web3Auth instance
  const [provider, setProvider] = useState<IProvider | null>(null); // State for provider instance
  const [loggedIn, setLoggedIn] = useState(false); // State to track if the user is logged in

  // Configuration for the XRPL chain
  const chainConfig = {
    chainNamespace: CHAIN_NAMESPACES.XRPL,
    chainId: "0x2",
    rpcTarget: "https://s.altnet.rippletest.net:51234/", // RPC endpoint for XRPL testnet
    wsTarget: "wss://s.altnet.rippletest.net:51233/", // WebSocket endpoint for XRPL testnet
    ticker: "XRP",
    tickerName: "XRPL",
    displayName: "xrpl testnet",
    blockExplorerUrl: "https://devnet.xrpl.org/", // Block explorer URL for XRPL testnet
  };

  // useEffect hook to initialize Web3Auth when the component mounts
  useEffect(() => {
    const init = async () => {
      try {
        // Initialize XRPL private key provider
        const xrplProvider = new XrplPrivateKeyProvider({
          config: {
            chainConfig: getXrplChainConfig(0x2), // Get XRPL chain configuration
          },
        });

        console.log(xrplProvider.config, "xrplProvider.config"); // Log provider configuration for debugging

        // Initialize Web3Auth with the specified configurations
        const web3auth = new Web3Auth({
          clientId,
          uiConfig: { // UI customization options
            appName: "W3A",
            theme: {
              primary: "red",
            },
            mode: "dark",
            logoLight: "https://web3auth.io/images/web3authlog.png",
            logoDark: "https://web3auth.io/images/web3authlogodark.png",
            defaultLanguage: "en",
            loginGridCol: 3,
            primaryButton: "externalLogin",
            uxMode: UX_MODE.REDIRECT,
          },
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET, // Web3Auth network configuration
          privateKeyProvider: xrplProvider, // XRPL private key provider
        });

        // Initialize and configure Openlogin adapter
        const openloginAdapter = new OpenloginAdapter({
          loginSettings: {
            mfaLevel: "optional",
          },
          adapterSettings: {
            uxMode: "redirect",
            whiteLabel: {
              logoLight: "https://web3auth.io/images/web3authlog.png",
              logoDark: "https://web3auth.io/images/web3authlogodark.png",
              defaultLanguage: "en",
            },
            mfaSettings: {
              deviceShareFactor: {
                enable: true,
                priority: 1,
                mandatory: true,
              },
              backUpShareFactor: {
                enable: true,
                priority: 2,
                mandatory: true,
              },
              socialBackupFactor: {
                enable: true,
                priority: 3,
                mandatory: true,
              },
              passwordFactor: {
                enable: true,
                priority: 4,
                mandatory: true,
              },
            },
          },
        });
        web3auth.configureAdapter(openloginAdapter); // Configure Web3Auth with the Openlogin adapter

        setWeb3auth(web3auth); // Set the Web3Auth instance in state

        await web3auth.initModal(); // Initialize the Web3Auth modal

        if (web3auth.connected) { // Check if already connected
          setProvider(web3auth?.provider); // Set the provider instance in state
          setLoggedIn(true); // Set logged in state to true
        }
      } catch (error) {
        console.error(error); // Log any errors that occur during initialization
      }
    };

    init(); // Call the init function
  }, []);

  // Function to handle user login
const login = async () => {
    if (!web3auth) {
      // If Web3Auth is not initialized, display a message in the UI console
      uiConsole("web3auth not initialized yet");
      return;
    }
    // Connect to Web3Auth and set the provider
    const webauthProvider = await web3auth.connect();
    setProvider(webauthProvider);
    setLoggedIn(true); // Update the state to indicate the user is logged in
  };
  
  // Function to authenticate the user
  const authenticateUser = async () => {
    if (!web3auth) {
      // If Web3Auth is not initialized, display a message in the UI console
      uiConsole("web3auth not initialized yet");
      return;
    }
    // Authenticate the user and get an ID token
    const idToken = await web3auth.authenticateUser();
    // Display the ID token in the UI console
    uiConsole(idToken);
  };
  
  // Function to get user information
  const getUserInfo = async () => {
    if (!web3auth) {
      // If Web3Auth is not initialized, display a message in the UI console
      uiConsole("web3auth not initialized yet");
      return;
    }
    // Retrieve user information from Web3Auth
    const user = await web3auth.getUserInfo();
    // Display the user information in the UI console
    uiConsole(user);
  };
  
  // Function to handle user logout
  const logout = async () => {
    if (!web3auth) {
      // If Web3Auth is not initialized, display a message in the UI console
      uiConsole("web3auth not initialized yet");
      return;
    }
    // Log out the user from Web3Auth
    await web3auth.logout();
    setProvider(null); // Reset the provider state
    setLoggedIn(false); // Update the state to indicate the user is logged out
  };
  
  // Function to get the accounts associated with the provider
  const getAccounts = async () => {
    if (!provider) {
      // If the provider is not initialized, display a message in the UI console
      uiConsole("provider not initialized yet");
      return;
    }
    // Create a new RPC instance with the provider
    const rpc = new RPC(provider);
    // Get the user accounts from the RPC instance
    const userAccount = await rpc.getAccounts();
    // Display the account information in the UI console
    uiConsole("Account info: ", userAccount);
  };
  
  // Function to get the balance of the user account
  const getBalance = async () => {
    if (!provider) {
      // If the provider is not initialized, display a message in the UI console
      uiConsole("provider not initialized yet");
      return;
    }
    // Create a new RPC instance with the provider
    const rpc = new RPC(provider);
    // Get the balance from the RPC instance
    const balance = await rpc.getBalance();
    // Display the balance in the UI console
    uiConsole("Balance", balance);
  };
  
  // Function to send a transaction
  const sendTransaction = async () => {
    if (!provider) {
      // If the provider is not initialized, display a message in the UI console
      uiConsole("provider not initialized yet");
      return;
    }
    // Create a new RPC instance with the provider
    const rpc = new RPC(provider);
    // Sign and send the transaction
    const result = await rpc.signAndSendTransaction();
    // Display the result of the transaction in the UI console
    uiConsole(result);
  };
  
  // Function to sign a message
  const signMessage = async () => {
    if (!provider) {
      // If the provider is not initialized, display a message in the UI console
      uiConsole("provider not initialized yet");
      return;
    }
    // Create a new RPC instance with the provider
    const rpc = new RPC(provider);
    // Sign the message
    const result = await rpc.signMessage();
    // Display the signed message in the UI console
    uiConsole(result);
  };
  
  // Function to get the account address
  const getAccountAddress = async () => {
    if (!provider) {
      // If the provider is not initialized, display a message in the UI console
      uiConsole("provider not initialized yet");
      return;
    }
    // Create a new RPC instance with the provider
    const rpc = new RPC(provider);
    // Get the account address
    const result = await rpc.getAccountAddress();
    // Display the account address in the UI console
    uiConsole(result);
  };
  
  // Function to get the wallet seed
//   const getWalletSeed = async () => {
//     if (!provider) {
//       // If the provider is not initialized, display a message in the UI console
//       uiConsole("provider not initialized yet");
//       return;
//     }
//     // Create a new RPC instance with the provider
//     const rpc = new RPC(provider);
//     // Get the wallet seed
//     const result = await rpc.getWalletSeed();
//     // Log the result in the console for debugging
//     console.log(result, "result: ");
//     // Display the wallet seed in the UI console
//     uiConsole(result);
//   };
  
  // Function to display messages in the UI console
  function uiConsole(...args) {
    // Find the HTML element to display the messages
    const el = document.querySelector("#console>p");
    if (el) {
      // Display the messages in the HTML element as a formatted JSON string
      el.innerHTML = JSON.stringify(args || {}, null, 2);
    }
  }

  // Component to display the view when the user is logged in
const loggedInView = (
    <>
      <div className="flex-container">
        <div>
          {/* Button to get user information */}
          <button onClick={getUserInfo} className="card">
            Get User Info
          </button>
        </div>
        <div>
          {/* Button to authenticate user and get ID token */}
          <button onClick={authenticateUser} className="card">
            Get ID Token
          </button>
        </div>
        <div>
          {/* Button to get the account address */}
          <button onClick={getAccountAddress} className="card">
            Address
          </button>
        </div>
        {/* <div>
          Button to get the wallet seed
          <button onClick={getWalletSeed} className="card">
            Seed
          </button>
        </div> */}
        <div>
          {/* Button to get user accounts */}
          <button onClick={getAccounts} className="card">
            Get Accounts
          </button>
        </div>
        <div>
          {/* Button to get the balance of the account */}
          <button onClick={getBalance} className="card">
            Get Balance
          </button>
        </div>
        <div>
          {/* Button to sign a message */}
          <button onClick={signMessage} className="card">
            Sign Message
          </button>
        </div>
        <div>
          {/* Button to send a transaction */}
          <button onClick={sendTransaction} className="card">
            Send Transaction
          </button>
        </div>
        <div>
          {/* Button to log out the user */}
          <button onClick={logout} className="card">
            Log Out
          </button>
        </div>
      </div>
      {/* Console to display messages */}
      <div id="console" style={{ whiteSpace: "pre-line" }}>
        <p style={{ whiteSpace: "pre-line" }}></p>
      </div>
    </>
  );
  
  // Component to display the view when the user is not logged in
  const unloggedInView = (
    <button onClick={login} className="card">
      Login
    </button>
  );
  
  // Main component to handle the Web3Auth authentication process
  return (
    <div>
      <div className="container">
        <h1 className="title">
          <a target="_blank" href="https://web3auth.io/docs/sdk/pnp/web/modal" rel="noreferrer">
            Web3Auth{" "}
          </a>
          & ReactJS XRPL Example
        </h1>
  
        {/* Display the loggedInView if logged in, otherwise display unloggedInView */}
        <div className="grid">{loggedIn ? loggedInView : unloggedInView}</div>
  
        <footer className="footer">
          {/* Link to the source code */}
          <a
            href="https://github.com/Web3Auth/web3auth-pnp-examples/tree/main/web-modal-sdk/blockchain-connection-examples/xrpl-modal-example"
            target="_blank"
            rel="noopener noreferrer"
          >
            Source code
          </a>
          {/* Button to deploy with Vercel */}
          <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FWeb3Auth%2Fweb3auth-pnp-examples%2Ftree%2Fmain%2Fweb-modal-sdk%2Fblockchain-connection-examples%2Fxrpl-modal-example&project-name=w3a-xrpl-modal&repository-name=w3a-xrpl-modal">
            <img src="https://vercel.com/button" alt="Deploy with Vercel" />
          </a>
        </footer>
      </div>
    </div>
  );
  
}

export default Web3Authentication;
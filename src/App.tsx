import algosdk from "algosdk";
import { useState, useEffect, type ReactNode } from "react";
import { Network, APIProvider, getAlgodClient } from "beaker-ts/lib/clients";
import {
  PlaceHolderSigner,
  SessionWalletManager,
  SessionWalletData,
} from "beaker-ts/lib/web";
import { ConstantProductAMM } from "../contracts/constantproductamm_client";

import WalletSelector from "./WalletSelector";
import { AppBar, Box, Toolbar, Typography, Divider, Tab, Tabs } from "@mui/material";

import CreateAssets from "./stages/0_create_assets";
import InitAMM from "./stages/1_init_amm";
import OptIn from "./stages/2_opt_in";
import AddLiquidity from "./stages/3_add_liquidity";
import Swap from "./stages/4_swap";
import Burn from "./stages/4_burn";

const TabPanel = (props: {children?: ReactNode, value: number, index: number, flexDirection: "row" | "column"}) => {
  const { children, value, index, flexDirection } = props;
  return(<div role="tabpanel" hidden={value !== index}>{value === index && <Box display="flex" flexDirection={flexDirection} gap={2}>{children}</Box>}</div>)
}

// AnonClient can still allow reads for an app but no transactions
// can be signed
const AnonClient = (client: algosdk.Algodv2, appId: number): ConstantProductAMM => {
  return new ConstantProductAMM({
    client: client,
    signer: PlaceHolderSigner,
    sender: "",
    appId: appId,
  });
};

export default function App() {
  // Start with no app id for this demo, since we allow creation
  // Otherwise it'd come in as part of conf
  const [app, setApp] = useState({
		stage: 0,
		data: {
      id: 0
    }
	})

  const [tab, setTab] = useState(0)

  // Setup config for client/network. 
  const [apiProvider, setApiProvider] = useState(APIProvider.Sandbox);
  const [network, setNetwork] = useState(Network.SandNet);
  // Init our algod client
  const algodClient = getAlgodClient(apiProvider, network);

  // Set up user wallet from session
  const [accountSettings, setAccountSettings] = useState<SessionWalletData>(
    SessionWalletManager.read(network)
  );

  // Init our app client
  const [appClient, setAppClient] = useState<ConstantProductAMM>(
    AnonClient(algodClient, app.data.id)
  );

  // If the account info, client, or app id change
  // update our app client
  useEffect(() => {
    // Bad way to track connected status but...
    if (accountSettings.data.acctList.length == 0 && appClient.sender !== "") {
      setAppClient(AnonClient(algodClient,  app.data.id));
    } else if (
      SessionWalletManager.connected(network) &&
      SessionWalletManager.address(network) !== appClient.sender
    ) {
      setAppClient(
        new ConstantProductAMM({
          client: algodClient,
          signer: SessionWalletManager.signer(network),
          sender: SessionWalletManager.address(network),
          appId: app.data.id,
        })
      );
    }
  }, [accountSettings, app.data.id, algodClient]);

  console.log(app)

  // The app ui
  return (
    <div className="App">
      <AppBar position="static">
        <Toolbar variant="regular">
          <Box sx={{ flexGrow: 1 }} />
          <Box>
            {/* 
              Adding our wallet selector here with hooks to acct settings 
              lets us provide an input for logging in with different wallets
              and updating session and in memory state
            */}
            <WalletSelector
              network={network}
              accountSettings={accountSettings}
              setAccountSettings={setAccountSettings}
            />
          </Box>
        </Toolbar>
      </AppBar>
      <Box display="flex" flexDirection="column" gap={2} mt={2} position="relative" alignItems="center">
        <Typography variant="h3" fontWeight={700} textAlign="center" mb={2}>Constant Product AMM Demo</Typography>
        <Tabs value={tab} onChange={(e, newVal) => setTab(newVal)}>
          <Tab label='Admin Setup' />
          <Tab label='AMM Functions' />
        </Tabs>
        <TabPanel value={tab} index={0} flexDirection="row">
          <CreateAssets app={app} setApp={setApp} appClient={appClient} />
          <InitAMM app={app} setApp={setApp} appClient={appClient} />
          <OptIn app={app} setApp={setApp} appClient={appClient} />
          <AddLiquidity app={app} setApp={setApp} appClient={appClient} />
        </TabPanel>
        <TabPanel value={tab} index={1} flexDirection="row">

          <Swap app={app} setApp={setApp} appClient={appClient} />
            <Burn app={app} setApp={setApp} appClient={appClient} />
        </TabPanel>
      </Box>
    </div>
  );
}

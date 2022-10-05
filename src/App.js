import { useState } from "react";
import { Typography, Box, CircularProgress, Link, Button } from "@mui/material";
import Header from "./components/Header";
import { useSandboxData, useSandboxActive } from "./hooks/useSandbox";
import useWallets from "./hooks/useWallets";

import { Algodv2, ABIContract } from "algosdk";
// import dao_abi from './contracts/dao_abi.json'

// const contract = new ABIContract(dao_abi)

export default function App() {
	const [app, setApp] = useState({
		stage: 0,
		data: {}
	})


	const [sandbox, setSandbox] = useSandboxData()
	const { data: sandbox_conn } = useSandboxActive(sandbox)

	const {data: wallets} = useWallets()

	const algod = new Algodv2(sandbox.algod_token, "http://localhost", sandbox.algod_port)

	console.log(app)

	return (
		<main id="App">
			<Header data={sandbox_conn} sandbox={sandbox} setSandbox={setSandbox} />
			<Typography variant="h3" fontWeight={700} textAlign="center" mb={2}>Extendable DAO Demo</Typography>
			
			{(!sandbox_conn.algod || !sandbox_conn.kmd || typeof wallets === 'undefined') ? 
			<CircularProgress color="primary" size="5rem" sx={{margin: '0 auto'}} /> : 
			<Box display="flex" flexDirection="column" gap={2} position="relative" alignItems="center">
				
			</Box>}
		</main>
	);
}

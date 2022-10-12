import { useState } from 'react'
import { Box, CardActions, CardContent, Chip, TextField, Button, Typography, Stack } from "@mui/material";
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { LoadingButton } from '@mui/lab';
import { useQuery } from "@tanstack/react-query";
import { makeAssetTransferTxnWithSuggestedParamsFromObject } from "algosdk";
import StageCard from "../components/StageCard";

export default function Swap({app, setApp, appClient}){

	const [swap, setSwap] = useState(true) // true => A to B; false => B to A
	const [amount, setAmount] = useState(100) // Swap Amount 
	const [ratio, setRatio] = useState(null)

	const { data, isFetching, isError, refetch } = useQuery(['4', 'swap', swap], async () => {


		const sp = await appClient.getSuggestedParams()
		sp.flatFee = true
		sp.fee = 2000

		let result = await appClient.swap({
			swap_xfer: makeAssetTransferTxnWithSuggestedParamsFromObject({
			  from: appClient.sender,
			  to: app.data.appAddress,
			  suggestedParams: await appClient.getSuggestedParams(),
			  amount: BigInt(1e3),
			  assetIndex: swap ? app.data.asaA : app.data.asaB,
			}),
		}, {suggestedParams: sp});

		let ratio = (await appClient.getApplicationState()).r

		return {amount: result.inners[0].txn.amount, ratio}
	}, {
		onSuccess: ({ratio}) => setRatio(ratio)
	})

	console.log('data', data)

	return(
		<StageCard currStage={app.stage} triggerStage={4} title="Swap" error={isError} sx={{width: '300px'}}>
			<CardContent>
				<Box display="flex" flexDirection="column" gap={2}>
					<Typography variant="h5">Swap {swap ? 'A to B' : 'B to A'}</Typography>
					<Stack direction="row" spacing={2}>
						<Chip label={`Ratio ${ratio || 'N/A'}`} />
						<TextField disabled={isFetching} type="number" variant="standard" size="small" InputProps={{ inputProps: { max: 1000, min: 1 }}} onChange={({target: {value}}) => value > 1000 ? setAmount(1000) : value <= 0 ? setAmount(1) : setAmount(parseInt(value))} value={amount} helperText={`Up to 1000 at once`} />
					</Stack>
					<Chip label={isFetching ? 'Swapping...' : typeof data !== 'undefined' ? `Recieved ${data.amount} ${swap ? 'B' : 'A'} Tokens` : 'No Tokens Swapped'} />
				</Box>
			</CardContent>
			<CardActions>
				<Button variant="contained" onClick={() => setSwap(!swap)}>
					<SwapHorizIcon />
				</Button>
				<LoadingButton color="success" variant="contained" onClick={() => refetch()} loading={isFetching} disabled={app.stage !== 4}>Swap</LoadingButton>
			</CardActions>
		</StageCard>
	)
}
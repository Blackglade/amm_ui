import { useState } from 'react'
import { Box, CardActions, CardContent, Chip, TextField } from "@mui/material";
import { LoadingButton } from '@mui/lab';
import { useQuery } from "@tanstack/react-query";
import { makeAssetTransferTxnWithSuggestedParamsFromObject } from "algosdk";
import StageCard from "../components/StageCard";

export default function Burn({app, setApp, appClient}){

	const [amount, setAmount] = useState(10) // Amount to Burn

	const poolTokensRemaining = app.data.poolTokenAmount || 0

	const { data, isFetching, isError, refetch } = useQuery(['4', 'burn'], async () => {

		const sp = await appClient.getSuggestedParams()
		sp.flatFee = true
		sp.fee = 3000

		let result = await appClient.burn({
			pool_xfer: makeAssetTransferTxnWithSuggestedParamsFromObject({
			  from: appClient.sender,
			  to: app.data.appAddress,
			  suggestedParams: await appClient.getSuggestedParams(),
			  amount: amount,
			  assetIndex: app.data.poolToken,
			}),
		}, {suggestedParams: sp});
		
		console.log(result)

		return {asaARecieved: result.inners[0].txn.amount, asaBRecieved: result.inners[1].txn.amount}
	}, {
		onSuccess: () => {
			setApp(prev => ({
				stage: 4,
				data: {
					...prev.data,
					poolTokenAmount: app.data.poolTokenAmount - amount
				}
			}))
		}
	})

	return(
		<StageCard currStage={app.stage} triggerStage={4} title="Burn Pool Tokens" error={isError} sx={{width: '300px'}}>
			<CardContent>
				<Box display="flex" flexDirection="column" gap={2}>
					<TextField disabled={isFetching} type="number" variant="standard" size="small" InputProps={{ inputProps: { max: poolTokensRemaining, min: 1 }}} onChange={({target: {value}}) => value > poolTokensRemaining ? setAmount(poolTokensRemaining) : value <= 0 ? setAmount(1) : setAmount(parseInt(value))} value={amount} helperText={`${poolTokensRemaining} Pool Tokens Remaining`} />
					<Chip label={isFetching ? 'Burning...' : typeof data !== 'undefined' ? `Recieved ${data.asaARecieved} A and ${data.asaBRecieved} B Tokens` : 'No Tokens Burned'} />
				</Box>
			</CardContent>
			<CardActions>
				<LoadingButton color="success" variant="contained" onClick={() => refetch()} loading={isFetching} disabled={app.stage !== 4 || poolTokensRemaining === 0}>Burn</LoadingButton>
			</CardActions>
		</StageCard>
	)
}
import { CardActions, CardContent, Typography, Chip } from "@mui/material";
import { LoadingButton } from '@mui/lab';
import { useQuery } from "@tanstack/react-query";
import { makeAssetTransferTxnWithSuggestedParamsFromObject, waitForConfirmation } from "algosdk";
import StageCard from "../components/StageCard";

export default function OptIn({app, setApp, appClient}){

	const { isFetching, isError, refetch } = useQuery(['2', 'opt_in'], async () => {

		const optInTxn = makeAssetTransferTxnWithSuggestedParamsFromObject({
			from: appClient.sender,
			to: appClient.sender,
			suggestedParams: await appClient.getSuggestedParams(),
			amount: 0,
			assetIndex: app.data.poolToken,
		})

		appClient.client.sendRawTransaction(await appClient.signer([optInTxn], [0])).do()

		await waitForConfirmation(appClient.client, optInTxn.txID(), 4)

		return true
	}, {
		onSuccess: () => {
			setApp(prev => ({
				stage: 3,
				data: prev.data
			}))
		}
	})

	return(
		<StageCard currStage={app.stage} triggerStage={2} title="Opt-In" error={isError}>
			<CardContent>
				<Chip label={'Pool Token ID: '  + ('poolToken' in app.data ? app.data.poolToken : 'N/A')} />
			</CardContent>
			<CardActions>
				<LoadingButton variant="contained" onClick={() => refetch()} loading={isFetching} disabled={app.stage !== 2}>Opt-In</LoadingButton>
			</CardActions>
		</StageCard>
	)
}
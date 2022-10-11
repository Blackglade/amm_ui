import { CardActions, CardContent, Chip } from "@mui/material";
import { LoadingButton } from '@mui/lab';
import { useQuery } from "@tanstack/react-query";
import { makeAssetTransferTxnWithSuggestedParamsFromObject } from "algosdk";
import StageCard from "../components/StageCard";

export default function AddLiquidity({app, setApp, appClient}){

	const { data, isFetching, isError, refetch } = useQuery(['3', 'add_liquidity'], async () => {

		let result = await appClient.mint({
			a_xfer: makeAssetTransferTxnWithSuggestedParamsFromObject({
			  from: appClient.sender,
			  to: app.data.appAddress,
			  suggestedParams: await appClient.getSuggestedParams(),
			  amount: BigInt(1e8),
			  assetIndex: app.data.asaA,
			}),
			b_xfer: makeAssetTransferTxnWithSuggestedParamsFromObject({
			  from: appClient.sender,
			  to: app.data.appAddress,
			  suggestedParams: await appClient.getSuggestedParams(),
			  amount: BigInt(1e6),
			  assetIndex: app.data.asaB,
			}),
		});

		return result.inners[0].txn.amount
	}, {
		onSuccess: (tokens) => {
			setApp(prev => ({
				stage: 4,
				data: {
					...prev.data,
					poolTokenAmount: tokens
				}
			}))
		}
	})

	return(
		<StageCard currStage={app.stage} triggerStage={3} title="Add Liquidity" error={isError}>
			<CardContent>
				<Chip label={typeof data !== 'undefined' ? `Recieved ${data} Pool Tokens` : 'No Liquidity'} />
			</CardContent>
			<CardActions>
				<LoadingButton variant="contained" onClick={() => refetch()} loading={isFetching} disabled={app.stage !== 3}>Add Liquidity</LoadingButton>
			</CardActions>
		</StageCard>
	)
}
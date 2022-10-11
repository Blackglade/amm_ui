import { useState } from "react";
import StageCard from "../components/StageCard";
import { CardActions, CardContent, Step, Stepper, StepLabel, Box, Divider, Chip } from "@mui/material";
import { LoadingButton } from '@mui/lab';
import { useQuery } from "@tanstack/react-query";
import { makeAssetCreateTxnWithSuggestedParamsFromObject, waitForConfirmation } from "algosdk";

export default function CreateAssets({app, setApp, appClient}){

	const [step, setStep] = useState(-1)

	const { isFetching, isError, refetch } = useQuery(['0', 'create_assets'], async () => {

		setStep(0)
		const asaATxn = makeAssetCreateTxnWithSuggestedParamsFromObject({
			from: appClient.sender,
			suggestedParams: await appClient.getSuggestedParams(),
			total: BigInt(1e10),
			decimals: 0,
			defaultFrozen: false,
			assetName: 'Asset A',
			unitName: 'A',
		});
		await appClient.client.sendRawTransaction(await appClient.signer([asaATxn], [0])).do()

		const aID = (await waitForConfirmation(appClient.client, asaATxn.txID(), 4))["asset-index"];

		setStep(2)
		const asaBTxn = makeAssetCreateTxnWithSuggestedParamsFromObject({
			from: appClient.sender,
			suggestedParams: await appClient.getSuggestedParams(),
			total: BigInt(1e10),
			decimals: 0,
			defaultFrozen: false,
			assetName: 'Asset B',
			unitName: 'B',
		});
		await appClient.client.sendRawTransaction(await appClient.signer([asaBTxn], [0])).do()

		const bID = (await waitForConfirmation(appClient.client, asaBTxn.txID(), 4))["asset-index"];

		setStep(2)

		return {asaA: aID, asaB: bID}
	}, {
		onSuccess: ({asaA, asaB}) => {

			setApp(prev => ({
				stage: 1,
				data: {
					...prev.data,
					asaA: asaA,
					asaB: asaB
				}
			}))
		}
	})


	return(
		<StageCard currStage={app.stage} triggerStage={0} title="Create Assets" error={isError}>
			<CardContent>
				<Box display="flex" justifyContent="space-between" mb={2}>
					<Chip label={('A ID: ' + ('asaA' in app.data ? app.data.asaA : ''))} />
					<Divider orientation="vertical" flexItem />
					<Chip label={('B ID: ' + ('asaB' in app.data ? app.data.asaB : ''))} />
				</Box>
				<Stepper activeStep={step} orientation="vertical">
					<Step><StepLabel>Create Asset A</StepLabel></Step>
					<Step><StepLabel>Create Asset B</StepLabel></Step>
				</Stepper>
			</CardContent>
			<CardActions>
				<LoadingButton variant="contained" onClick={() => refetch()} loading={isFetching} disabled={app.stage !== 0}>Create Assets</LoadingButton>
			</CardActions>
		</StageCard>
	)
}
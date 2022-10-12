import { useState } from "react";
import { CardActions, CardContent, Step, Stepper, StepLabel, Box, Chip } from "@mui/material";
import { LoadingButton } from '@mui/lab';
import { useQuery } from "@tanstack/react-query";
import { getApplicationAddress, makePaymentTxnWithSuggestedParamsFromObject } from "algosdk";
import StageCard from "../components/StageCard";

export default function InitAMM({app, setApp, appClient}){

	const [step, setStep] = useState(-1)

	const { isFetching, isError, refetch } = useQuery(['1', 'init_amm'], async () => {
		setStep(0)
		const {appId} = await appClient.create();
		const appAddress = getApplicationAddress(appId);

		const sp = await appClient.getSuggestedParams()
		sp.flatFee = true
		sp.fee = 4000

		setStep(1)
		const bootstrapResult = await appClient.bootstrap({
			seed: makePaymentTxnWithSuggestedParamsFromObject({
			  from: appClient.sender,
			  to: appAddress,
			  suggestedParams: await appClient.getSuggestedParams(),
			  amount: BigInt(1e6),
			}),
			a_asset: app.data.asaA,
			b_asset: app.data.asaB,
		}, {suggestedParams: sp});
		
		if (bootstrapResult?.value === undefined) throw new Error("Bootstrap failed?");

		setStep(2)

		return {id: appId, poolToken: parseInt(bootstrapResult.value), appAddress}
	}, {
		onSuccess: ({id, poolToken, appAddress}) => {
			setApp(prev => ({
				stage: 2,
				data: {
					...prev.data,
					id: id,
					poolToken,
					appAddress
				}
			}))
		}
	})

	return(
		<StageCard currStage={app.stage} triggerStage={1} title="Init AMM" error={isError} sx={{width: '350px'}}>
			<CardContent>
				<Box display="flex" flexDirection="column" gap={1}>
					<Chip label={('App ID: ' + (app.data.id !== 0 ? app.data.id : 'Not Deployed'))} />
					<Chip label={('App Address: ' + (app.data.id !== 0 ? app.data.appAddress : 'Not Deployed'))} />
				</Box>
				<Stepper activeStep={step} orientation="vertical">
					<Step><StepLabel>Deploy AMM Contract</StepLabel></Step>
					<Step><StepLabel>Bootstrap AMM Contract</StepLabel></Step>
				</Stepper>
			</CardContent>
			<CardActions>
				<LoadingButton variant="contained" onClick={() => refetch()} loading={isFetching} disabled={app.stage !== 1}>Initialize AMM</LoadingButton>
			</CardActions>
		</StageCard>
	)
}
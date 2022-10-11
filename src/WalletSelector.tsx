import * as React from "react";
import {
  SessionWalletData,
  ImplementedWallets,
  SessionWalletManager,
} from "beaker-ts/lib/web";
import {
  Avatar,
  Select,
  Button,
  Dialog,
  Box,
  Grid,
  DialogContent,
  DialogTitle,
  DialogActions,
  MenuItem,
  ButtonGroup,
  IconButton,
  Typography,
} from "@mui/material";

import { WalletRounded } from '@mui/icons-material';
import LoadingButton from "@mui/lab/LoadingButton";
import CloseIcon from "@mui/icons-material/Close";
import { WalletName } from "beaker-ts/lib/web/session_wallet";

type WalletSelectorProps = {
  network: string;
  accountSettings: SessionWalletData;
  setAccountSettings: (swd: SessionWalletData) => void;
};

export default function WalletSelector(props: WalletSelectorProps) {
  const [selectorOpen, setSelectorOpen] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const { network, accountSettings, setAccountSettings } = props;

  function disconnectWallet() {
    SessionWalletManager.disconnect(network);
    setAccountSettings(SessionWalletManager.read(network));
  }

  function handleChangeAccount(e: any) {
    const acctIdx = parseInt(e.target.value);
    SessionWalletManager.setAcctIdx(network, acctIdx);
    setAccountSettings(SessionWalletManager.read(network));
  }

  async function handleSelectedWallet(choice: string) {
    SessionWalletManager.setWalletPreference(network, choice as WalletName);
    setLoading(true)
    await SessionWalletManager.connect(network);
    setAccountSettings(SessionWalletManager.read(network));
    setLoading(false)
  }

  const display = !accountSettings.data.acctList.length ? (
    <Button startIcon={<WalletRounded />}
      variant="outlined"
      disabled={loading}
      color="primary"
      onClick={() => {
        setSelectorOpen(!selectorOpen);
      }}
    >
      Connect Wallet
    </Button>
  ) : (
    <Box>
      <ButtonGroup variant="text">
        <Select
          onChange={handleChangeAccount}
          variant="standard"
          value={accountSettings.data.defaultAcctIdx}
        >
          {accountSettings.data.acctList.map((addr, idx) => {
            return (
              <MenuItem value={idx} key={idx}>
                {addr.slice(0, 8)}
              </MenuItem>
            );
          })}
        </Select>
        <IconButton onClick={disconnectWallet} size="small">
          <CloseIcon htmlColor="red" />
        </IconButton>
      </ButtonGroup>
    </Box>
  );

  return (
    <div>
      {display}
      <WalletSelectorDialog
        open={selectorOpen}
        handleSelection={handleSelectedWallet}
        onClose={() => {
          setSelectorOpen(false);
        }}
      />
    </div>
  );
}

type WalletSelectorDialogProps = {
  open: boolean;
  handleSelection(value: string): void;
  onClose(): void;
};

function WalletSelectorDialog(props: WalletSelectorDialogProps) {
  function handleWalletSelected(e: any) {
    props.handleSelection(e.currentTarget.id);
    props.onClose();
  }

  const walletOptions = [];
  for (const [k, v] of Object.entries(ImplementedWallets)) {
    const imgSrc = v.img(false);

    walletOptions.push(
      <Grid item key={k}>
        <Button id={k} variant="outlined" onClick={handleWalletSelected} startIcon={<Avatar src={imgSrc} />}>
          <Typography>{v.displayName()}</Typography>
        </Button>
      </Grid>
    );
  }

  return (
    <div>
      <Dialog maxWidth='xs' open={props.open} onClose={props.onClose}>
        <DialogTitle align="center" fontWeight={700}>Select Wallet</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {walletOptions}
          </Grid>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import TextField from '@mui/material/TextField';
import { Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useState } from 'react';
import Web3 from 'web3';
import db from "../../firebase";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { isValidEthereumAddress } from '../../MetamMask';
import { isGoerliTestnet } from '../../MetamMask';

export const TxStatus = {
    PENDING: 'PENDING',
    SUCCESS: 'SUCCESS',
    FAILED: 'FAILED',
};

export default function Transaction() {

    const classes = useStyles();

    const [address, setAddress] = useState('')
    const [amount, setAmount] = useState('')
    const [transaction, setTansaction] = useState('')
    const [isShown, setIsShown] = useState(false);


    function isValidAmount(amount) {
        if (amount > 0) {
            return true;
        }
        return false;
    }

    function GetCurentAddress() {
        if (window.ethereum) {
            return window.ethereum.selectedAddress
        }
    }

    function addFirebaseEntry(txHash, toAddr, fromAddr, amount) {
        db.collection("Transactions").doc(txHash).set({
            txHash: txHash,
            from: fromAddr,
            to: toAddr,
            amount: amount,
            date: new Date(),
            status: TxStatus.PENDING,
        })
    }

    const checkTransactionStatus = async (txHash) => {
        const web3 = new Web3(window.ethereum);
        const receipt = await web3.eth.getTransactionReceipt(txHash);
        if (receipt) {
            if (receipt.status) {
                setTansaction(TxStatus.SUCCESS)
                db.collection("Transactions").doc(txHash).update({
                    status: TxStatus.SUCCESS,
                }).then(() => {
                    console.log("Document successfully updated!");
                })
                    .catch((error) => {
                        console.error("Error updating document: ", error);
                    });
            } else {
                setTansaction(TxStatus.FAILED)
                db.collection("Transactions").doc(txHash).update({
                    status: TxStatus.FAILED,
                }).then(() => {
                    console.log("Document successfully updated!");
                })
                    .catch((error) => {
                        console.error("Error updating document: ", error);
                    });
            }
        } else {
            setTansaction(TxStatus.PENDING)
            setTimeout(() => {
                checkTransactionStatus(txHash);

            }, 2000);
        }
    };


    const makeTransaction = async () => {

        const fromAddr = GetCurentAddress();
        const toAddr = address;

        if (isValidEthereumAddress(toAddr) && isValidAmount(fromAddr)) {
            const gasPrice = '0x5208' // 21000 Gas Price
            const amountHex = (amount * Math.pow(10, 18)).toString(16)

            const tx = {
                from: fromAddr,
                to: toAddr,
                value: amountHex,
                gas: gasPrice,
            }

            window.ethereum.request({ method: 'eth_sendTransaction', params: [tx] }).then((txHash) => {
                addFirebaseEntry(txHash, toAddr, fromAddr, amount)
                checkTransactionStatus(txHash)
                setTansaction("")
            }
            ).catch((error) => {
                setTansaction(error.message)
            })
            setIsShown(true)
        }
    }

    const handleClose = () => {
        setIsShown(false)
        setTansaction('')
    };


    return (
        <Paper sx={{ "&:hover": { boxShadow: "0px 0px 10px 10px rgba(255, 255, 255, 0.12)" } }} className={classes.root}>
            <CardContent>
                <Typography align='center' sx={{ m: 2, fontWeight: 'bold', fontSize: 32, color: "#ffffff" }} variant='h4' color="text.secondary" gutterBottom>
                    Send Ethereum
                </Typography>
                <ValidationTextField
                    label="Address"
                    required
                    variant="outlined"
                    id="validation-outlined-input"
                    fullWidth

                    onChange={event => setAddress(event.target.value)}

                />
                <ValidationTextField
                    label="Amount"
                    required
                    variant="outlined"
                    id="validation-outlined-input"
                    fullWidth

                    type="number" step="0.1" min='0' onChange={event => setAmount(event.target.value)}

                />


            </CardContent>

            <CardActions>
                <Button
                    disabled={!isValidEthereumAddress(address) || !isValidAmount(amount) || !isGoerliTestnet()}
                    onClick={() => { makeTransaction() }}
                    sx={{
                        "&.Mui-disabled": {
                            color: "grey",
                            border: "1px solid grey",
                        }, fontWeight: 'bold', fontSize: 18, textTransform: 'capitalize', color: "white"
                    }}
                    variant="outlined"
                    color="inherit"
                    size="large" >
                    Send
                </Button>
            </CardActions>
            {
                isShown === true && transaction ? (
                    <Snackbar open={isShown}
                        autoHideDuration={10000}
                        onClick={handleClose}
                        onClose={handleClose}
                        anchorOrigin={{ vertical: "top", horizontal: "right" }}
                    >
                        <Alert
                            onClose={handleClose}
                            severity={transaction === TxStatus.SUCCESS ? "success" : (transaction === TxStatus.PENDING) ? "info" : "error"}
                            sx={{ width: '100%' }}>
                            {transaction}
                        </Alert>
                    </Snackbar>
                ) : (null)
            }
        </Paper>
    );
}

const ValidationTextField = styled(TextField)({
    "& input:valid + fieldset": {
        borderColor: "white",
        borderWidth: 2,
    },
    "& .MuiOutlinedInput-root:hover": {
        "& > fieldset": {
            borderColor: "grey"
        }
    },

    "& input:valid:focus + fieldset": {
        padding: "4px !important", // override inline-style
    },
    input: { color: "white" },
    text: "white",
    marginBottom: "1.5rem",

    "& .MuiInputLabel-root": { color: "white" }, //styles the label
    "& .MuiOutlinedInput-root": {
        "& > fieldset": { borderColor: "white" },
    },
    "& .MuiOutlinedInput-root.Mui-focused": {
        "& > fieldset": {
            borderColor: "white"
        }
    }

});

const useStyles = makeStyles({
    textField: {
        mb: 1.5,
        width: '100%',
        input: { color: 'red' },
        color: 'white',
    },

    root: {
        border: "1px solid grey",
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(45deg, #0D111C 20%, #0D111C 80%)',
        borderRadius: 36,
        padding: '10px',
        margin: '30px',
    },
});

import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { makeStyles } from '@mui/styles';
import { isMetaMaskInstalled, DownloadMetaMask, isValidEthereumAddress, isGoerliTestnet } from '../../MetamMask'
import { useState } from 'react';
import { useEffect } from 'react';
import { ethers } from 'ethers';
import Chip from '@mui/material/Chip';
import CurrencyBitcoinRoundedIcon from '@mui/icons-material/CurrencyBitcoinRounded';

export default function Header() {
    const classes = useStyles();
    const [buttonText, setButtonText] = useState("Connect to MetaMask");

    const [data, setdata] = useState({
        address: '',    // Stores address
        addressShort: '',    // Stores address short
        Balance: ''  // Stores balance
    })

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('chainChanged', () => {
                checkMetamaskStatus()
            })
            window.ethereum.on('accountsChanged', () => {
                checkMetamaskStatus()
            })
        }
    }, [])


    const checkMetamaskStatus = () => {

        if (!isMetaMaskInstalled()) {
            setButtonText('Install MetaMask')
            return
        }

        let address = isMetaMaskConnected()

        if (isValidEthereumAddress(address)) {
            if (!isGoerliTestnet()) {
                setButtonText('Please select Goerli Testnet')
            } else {
                setButtonText(address)

            }
        } else {
            setButtonText('Connect to MetaMask')
        }
    }

    const isMetaMaskConnected = () => {

        window.ethereum.request({ method: 'eth_requestAccounts' }).then(res => {
            if (!isGoerliTestnet()) {
                setButtonText('Please select Goerli Testnet')
            } else if (res[0].length) {
                let address = res[0]
                setButtonText(address.substring(0, 5) +
                    "..." +
                    address.substring(window.ethereum.selectedAddress.length - 5, address.length))

                window.ethereum.request({
                    method: 'eth_getBalance',
                    params: [address, 'latest']
                }).then(balance => {
                    setdata({
                        address: address,
                        Balance: ethers.utils.formatEther(balance),
                        addressShort: address.substring(0, 5) + "..." + address.substring(window.ethereum.selectedAddress.length - 5, address.length)
                    })
                })

            } else {
                setButtonText('Connect to MetaMask')
            }
        })
    }

    function ConnectToMetaMask() {

        if (!isMetaMaskInstalled()) {
            DownloadMetaMask()
            setButtonText("Connect to MetaMask")
        } else {
            checkMetamaskStatus()
        }
    }

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static" className={classes.root}>
                <Toolbar>
                    <Typography style={{ textTransform: 'none', fontWeight: 'bold', }}
                        variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Ethereum
                    </Typography>
                    <Button
                        size='large'
                        style={{ textTransform: 'none', fontWeight: 'bold', }}
                        variant="outlined"
                        color="inherit"
                        onClick={() => setButtonText(ConnectToMetaMask())}>{data.address ? data.addressShort : buttonText}
                        {
                            data.Balance ?
                                <Chip style={{ color: 'white' }} size="medium" icon={<CurrencyBitcoinRoundedIcon style={{ color: 'white' }} />} label={"Balance: " + data.Balance} />
                                : null
                        }
                    </Button>

                </Toolbar>
            </AppBar>
        </Box>
    );
}

const useStyles = makeStyles({
    root: {
        background: 'linear-gradient(45deg, #070917 40%, #131726 60%)',
        boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
        padding: '0 30px',
    },
});

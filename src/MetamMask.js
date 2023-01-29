import Web3 from 'web3'

const networkVersion = 0x5 // Goerli Testnet

export function isValidEthereumAddress(address) {
    return Web3.utils.isAddress(address)
}

export function isGoerliTestnet() {
    
    return Boolean(window.ethereum.networkVersion === networkVersion.toString());
}

export function isMetaMaskInstalled() {
    const { ethereum } = window;
    return Boolean(ethereum && ethereum.isMetaMask);
}

export function DownloadMetaMask() {
    window.open('https://metamask.io/download.html', '_blank');
}

export function GetCurentAddress() {
    if (window.ethereum) {
        return window.ethereum.selectedAddress
    }
}

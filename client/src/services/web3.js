import { ethers } from 'ethers'

export function isMetaMaskInstalled() {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined'
}

export async function getWalletAddress() {
    if (!isMetaMaskInstalled()) return null
    try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        return accounts.length > 0 ? accounts[0] : null
    } catch {
        return null
    }
}

export async function connectWallet() {
    if (!isMetaMaskInstalled()) {
        throw new Error('MetaMask is not installed. Please install it from metamask.io')
    }
    await window.ethereum.request({ method: 'eth_requestAccounts' })
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const address = await signer.getAddress()
    return { signer, address, provider }
}

export async function logTaskOnChain(taskId, employeeId) {
    if (!isMetaMaskInstalled()) {
        throw new Error('MetaMask is not installed')
    }

    const { signer, address } = await connectWallet()

    const payload = JSON.stringify({
        taskId,
        employeeId,
        status: 'COMPLETED',
        timestamp: Date.now(),
    })

    const data = ethers.hexlify(ethers.toUtf8Bytes(payload))

    const tx = await signer.sendTransaction({
        to: address, // self transaction to log on chain
        value: 0n,
        data,
    })

    await tx.wait()
    return tx.hash
}

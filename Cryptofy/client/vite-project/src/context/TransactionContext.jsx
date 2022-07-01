import React, { useEffect, useState } from "react"

import { ethers } from "ethers";

import { contractABI, contractAddress } from "../utils/Constants"
import { createContext } from "react";

export const TransactionContext = createContext()

const { ethereum } = window

const getEthereumContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    const transactionContract = new ethers.Contract(contractAddress, contractABI, signer)
    //console.log({provider, signer, transactionContract})
    return transactionContract
}

export const TransactionProvider = ({ children }) => {
    const [connectedAccount, setConnectedAccount] = useState("")
    const [formData, setFormData] = useState({ addressTo: "", amount: "", keyword: "", message: "" })
    const [address, setAddress] = useState("")
    const [amount, setAmount] = useState("")
    const [keyword, setKeyword] = useState("")
    const [message, setMessage] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [transactions,setTransactions]=useState([])
    const handleChange = (e, name) => {
        //console.log(e.target.value)
        setFormData((prevState) =>
            ({ ...prevState, [name]: e.target.value })

        )
    }

    const checkIfWalletIsConnected = async () => {
        if (!ethereum) return alert("Please install metamask")
        const accounts = await ethereum.request({ method: "eth_accounts" })
        if (accounts.length > 0) {
            setConnectedAccount(accounts[0])
            getAllTransactions()
        }
       

        else {
            console.log("No accounts found")
        }
        //console.log(accounts)
    }

    const getAllTransactions = async () => {
        try {
            if (!ethereum) return alert("Please install metamask")
            const transactionContract = getEthereumContract()
            const totalTransactions = await transactionContract.getAllTransactions()
            const structuredTransactions=totalTransactions.map((transaction)=>{
                return {
                    addressTo:transaction.receiver,
                    addressFrom :transaction.sender,
                    amount :parseInt(transaction.amount._hex)/(10**18),
                    keyword: transaction.keyword,
                    message: transaction.message,
                    timestamp:new Date(transaction.timestamp.toNumber()*1000).toLocaleString()
                }
            })
            let latestTransactions=structuredTransactions.reverse()
            latestTransactions=latestTransactions.slice(0,5)
            setTransactions(latestTransactions)
            
            console.log(latestTransactions)
           
        }
        catch (e) {
            console.log(e)
        }
    }

    const checkIfTransactionsExist = async () => {
        try {
            const transactionContract = getEthereumContract()

        }
        catch (err) {
            console.log(err)
        }
    }

    const connectWallet = async () => {
        try {
            if (!ethereum) return alert("Please install metamask")
            const accounts = await ethereum.request({ method: "eth_requestAccounts" })
            setConnectedAccount(accounts[0])
            console.log(accounts[0])
            getAllTransactions()
        }
        catch (error) {
            console.log("No ethereum Object")

        }
    }

    const sendTransaction = async () => {
        try {
            if (!ethereum) return alert("Please install metamask")
            const transactionContract = getEthereumContract()
            const convertedAmount = ethers.utils.parseEther(amount)
            //console.log(transactionContract)
            await ethereum.request({
                method: "eth_sendTransaction",
                params: [{
                    from: connectedAccount,
                    to: address,
                    gas: "0x5208",
                    value: convertedAmount._hex,
                    //2100 gwei
                }]
            })
            //console.log("yello")
            const transactionHash = await transactionContract.addToBlockChain(address, convertedAmount, message, keyword)
            setIsLoading(true)
            await transactionHash.wait()
            setIsLoading(false)
            console.log("hash", transactionHash.hash)
            
            getAllTransactions()
            //location.reload()
        }
        catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        checkIfWalletIsConnected()
    }, [])

    return (
        <TransactionContext.Provider value={{ connectWallet, connectedAccount, handleChange, formData, sendTransaction, setAddress, setAmount, setKeyword, setMessage, address, amount, keyword, message,isLoading,transactions }}>
            {children}
        </TransactionContext.Provider>
    )
}
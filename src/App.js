import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled, { keyframes } from 'styled-components';
import Web3 from "web3";
import { Arwes, ThemeProvider, SoundsProvider, createSounds, createTheme, Frame, Button, Loading, Logo, Words, Puffs } from 'arwes';
import clickSound from './object.mp3';

const theme = createTheme({
  typography: {
    headerFontFamily: 'Orbitron, sans-serif',
    buttonFontFamily: 'Orbitron, sans-serif',
  },
});

const clickAudio = new Audio(clickSound);

const rotateAnimation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const sounds = {
  shared: { volume: 1 },
  players: {
    click: { sound: { src: ['/click.mp3'] } },
    typing: { sound: { src: ['/type.mp3'] } },
    deploy: { sound: { src: ['/object.mp3'] } },
  },
};

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  @media (min-width: 767px) {
    flex-direction: column;
  }
`;

export const StyledLogo = styled.img`
  width: 150px;
  @media (min-width: 767px) {
    width: 150px;
  }
  transition: width 0.5s, height 0.5s; 
  animation: ${rotateAnimation} 30s linear infinite;
`;

export const StyledLink = styled.a`
  color: var(--secondary);
  text-decoration: none;
  font-size: 20px;
`;

const ReleasableAmountText = styled.p`
  color: ${props => props.amount > 0 ? 'green' : 'red'};
  font-size: 18px;
  text-align: center;
`;

const BackgroundImage = styled.div`
  position: fixed;
  width: 100%;
  height: 100vh;
  top: 0;
  left: 0;
  background-image: url('https://wallpapercave.com/wp/wp8216900.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: -1;
`;

const PuffsContainer = styled.div`
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
`;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
  });
  const [vestingDetails, setVestingDetails] = useState(null);
  const [releasableAmount, setReleasableAmount] = useState(0);
  const [releasing, setReleasing] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  const getVestingDetails = async (address) => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      const abiResponse = await fetch("/config/vest_abi.json");
      const contractABI = await abiResponse.json();
      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(contractABI, CONFIG.CONTRACT_ADDRESS);

      const details = await contract.methods.getBeneficiaryDetails(address).call();
      setVestingDetails(details);
      setCountdown(parseInt(details.nextReleaseInSeconds, 10));

      const releasable = await contract.methods.releasableAmount(address).call();
      setReleasableAmount(Web3.utils.fromWei(releasable.toString(), "ether"));
    }
  };

  const releaseTokens = async () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      setReleasing(true);
      const abiResponse = await fetch("/config/vest_abi.json");
      const contractABI = await abiResponse.json();
      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(contractABI, CONFIG.CONTRACT_ADDRESS);

      await contract.methods.release().send({ from: blockchain.account })
        .on("error", (err) => {
          console.error(err);
          setReleasing(false);
        })
        .on("receipt", (receipt) => {
          console.log(receipt);
          setReleasing(false);
          getVestingDetails(blockchain.account);
        });
    }
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    if (blockchain.account) {
      getVestingDetails(blockchain.account);
    }
  }, [blockchain.account]);

  useEffect(() => {
    if (countdown > 0) {
      const interval = setInterval(() => {
        setCountdown(prevCountdown => prevCountdown - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [countdown]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (blockchain.account) {
        getVestingDetails(blockchain.account);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [blockchain.account]);

  return (
    <ThemeProvider theme={theme}>
      <SoundsProvider sounds={sounds}>
        <Arwes animate>
          <Frame animate>
            <s.Screen>
              <BackgroundImage />
              <PuffsContainer>
                <Puffs>
                  <div style={{ width: '100%', height: '100vh' }} />
                </Puffs>
              </PuffsContainer>
              <ResponsiveWrapper>
                <s.Container
                  flex={1}
                  ai={"center"}
                  style={{ padding: 24, backgroundColor: "var(--primary)" }}
                >
                  <Logo animate size={100} onClick={(e) => { clickAudio.play(); }} />
                  <br />
                  <h1><Words animate>Nexus Vesting</Words></h1>
                  <s.SpacerSmall />
                  {blockchain.account === "" || blockchain.smartContract === null ? (
                    <s.Container ai={"center"} jc={"center"}>
                      <Frame
                        animate
                        level={3}
                        corners={10}
                        layer='primary'
                        onClick={(e) => {
                          e.preventDefault();
                          dispatch(connect());
                        }}
                      >
                        <span style={{ padding: '20px 30px' }}>CONNECT TO THE NEXUS CORE</span>
                      </Frame>
                      {blockchain.errorMsg !== "" ? (
                        <>
                          <s.SpacerSmall />
                          <s.TextDescription
                            style={{
                              textAlign: "center",
                              color: "var(--accent-text)",
                            }}
                          >
                            {blockchain.errorMsg}
                          </s.TextDescription>
                        </>
                      ) : null}
                    </s.Container>
                  ) : (
                    <>
                      <s.TextDescription
                        style={{
                          textAlign: "center",
                          color: "var(--accent-text)",
                        }}
                      >
                        {truncate(blockchain.account, 100)}
                      </s.TextDescription>
                      {vestingDetails && (
                        <s.Container ai={"center"} jc={"center"}>
                          <s.TextDescription>
                            Total Amount: {Web3.utils.fromWei(vestingDetails.totalAmount.toString(), "ether")} NEXU
                          </s.TextDescription>
                          <s.TextDescription>
                            Released Amount: {Web3.utils.fromWei(vestingDetails.releasedAmount.toString(), "ether")} NEXU
                          </s.TextDescription>
                          <s.TextDescription>
                            Next Release In: {countdown} seconds
                          </s.TextDescription>
                          <s.TextDescription>
                            Next Release Amount: {Web3.utils.fromWei(vestingDetails.nextReleaseAmount.toString(), "ether")} NEXU
                          </s.TextDescription>
                          <ReleasableAmountText amount={releasableAmount}>
                            Releasable Amount: {releasableAmount} NEXU
                          </ReleasableAmountText>
                          <s.SpacerSmall />
                          <Frame
                            animate
                            level={3}
                            corners={10}
                            layer={releasableAmount > 0 ? 'primary' : 'alert'}
                            onClick={(e) => {
                              e.preventDefault();
                              releaseTokens();
                            }}
                            disabled={releasing || releasableAmount <= 0}
                          >
                            <span style={{ padding: '20px 30px' }}>{releasing ? 'RELEASING...' : 'RELEASE'}</span>
                          </Frame>
                        </s.Container>
                      )}
                    </>
                  )}
                  <s.SpacerMedium />
                </s.Container>
              </ResponsiveWrapper>
            </s.Screen >
          </Frame>
        </Arwes>
      </SoundsProvider>
    </ThemeProvider >
  );
}

export default App;

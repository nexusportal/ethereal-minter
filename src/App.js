import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled, { keyframes } from 'styled-components';
import CountDown from "./countdown";
import Web3 from "web3";
import { FaTelegramPlane, FaDiscord, FaTwitter, FaPlus, FiMinus, FaMinus } from "react-icons/fa";
import loop from './bg.mp4'
import { Arwes, ThemeProvider, SoundsProvider, createSounds, createTheme, Frame, Button, Loading, Logo, Words } from 'arwes';
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
    click: { sound: { src: ['/object.mp3'] } },
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
  transition: width 0.5s, height 0.5s; /* Combined transition properties */
  animation: ${rotateAnimation} 30s linear infinite; /* Apply the rotation animation */
`;

export const StyledImg = styled.img`
  // box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0.7);
  // border: 4px dashed var(--secondary);
  // background-color: var(--accent);
  // border-radius: 100%;
  width: 200px;
  @media (min-width: 900px) {
    width: 250px;
  }
  @media (min-width: 1000px) {
    width: 300px;
  }
  transition: width 0.5s;
`;

export const StyledLink = styled.a`
  color: var(--secondary);
  text-decoration: none;
  font-size: 20px;

`;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`You are making history!`);
  const [mintAmount, setMintAmount] = useState(1);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

  const claimNFTs = () => {
    let cost = CONFIG.ETH_COST;
    let totalCostEther = String(cost * mintAmount);
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalGasLimit = String(gasLimit * mintAmount);
    console.log("Cost: ", totalCostEther);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Minting ${CONFIG.NFT_NAME}...`);
    setClaimingNft(true);
    blockchain.smartContract.methods
      .mint(mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: Web3.utils.toWei(totalCostEther, "ether"),
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `You have summoned ${CONFIG.NFT_NAME}!`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 10) {
      newMintAmount = 10;
    }
    setMintAmount(newMintAmount);
  };

  const whaleMint = () => {
    let whaleMintAmount = 1;
    setMintAmount(whaleMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

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

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);


  return (
    <ThemeProvider theme={theme}>
      <SoundsProvider sounds={sounds}>

        <Arwes animate>
          <Frame animate>
            <s.Screen>
              <ResponsiveWrapper>
                <video
                  autoPlay
                  loop
                  muted
                  style={{
                    position: "fixed",
                    width: "100%",
                    left: "50%",
                    top: "50%",
                    height: "100%",
                    objectFit: "cover",
                    transform: "translate(-50%, -50%)",
                    zIndex: "-1",


                  }}>

                  <source src={loop} type="video/mp4" />

                </video>


                <s.Container
                  flex={1}
                  ai={"center"}
                  style={{ padding: 24, backgroundColor: "var(--primary)", }}
                // image={CONFIG.SHOW_BACKGROUND ? "/config/images/bg.jpg" : null}
                >
                  <a rel="noopener noreferrer" href="https://thenexusportal.io/">
                    <StyledLogo alt={"logo"} src={"/config/images/logo.png"} />
                  </a>


                  <div className="social-container">

                    <a target="_blank" rel="noopener noreferrer" href="https://twitter.com/PoweredByNEXUS">
                      <FaTwitter color="white" size={30} />
                    </a>
                    <a target="_blank" rel="noopener noreferrer" href="https://discord.gg/nexusportal">
                      <FaDiscord color="white" size={30} />
                    </a>

                    {/* <a target="_blank" rel="noopener noreferrer" href="https://t.me/">
              <FaTelegramPlane color="white" size={30} />
            </a> */}

                  </div>

                  <h1><Words animate>Welcome To The Nexus Portal</Words></h1>

                  <s.Container
                    flex={2}
                    jc={"center"}
                    ai={"center"}
                    style={{
                      backgroundColor: "var(--gold-gradient-box)",
                      padding: 1,
                      // borderRadius: 24,
                      // border: "4px solid var(--secondary)",
                      // boxShadow: "0px 5px 11px 2px rgba(0,0,0,0.7)",
                    }}
                  >

                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--primary-text)",
                      }}
                    >

                      <br />
                      <StyledLink target={"_blank"} href={"https://faucet.apothem.network/"} onClick={(e) => { clickAudio.play(); }}>
                        tXDC Faucet
                      </StyledLink>

                    </s.TextDescription>

                    <s.SpacerSmall />

                    {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
                      <>
                        <s.TextTitle
                          style={{ textAlign: "center", color: "var(--accent-text)" }}
                        >
                          The sale has ended.
                        </s.TextTitle>
                        <s.TextDescription
                          style={{ textAlign: "center", color: "var(--accent-text)" }}
                        >
                          You can still find {CONFIG.NFT_NAME} on
                        </s.TextDescription>
                        <s.SpacerSmall />
                        <StyledLink target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
                          {CONFIG.MARKETPLACE}
                        </StyledLink>
                      </>
                    ) : (
                      <>
                        <s.TextTitle
                          style={{ textAlign: "center", color: "var(--accent-text)" }}
                        >
                          {CONFIG.NFT_NAME} cost {CONFIG.DISPLAY_COST}{" "}
                          {CONFIG.NETWORK.SYMBOL}
                        </s.TextTitle>
                        <s.SpacerXSmall />
                        {/* 
                <s.TextTitle
                  style={{
                    textAlign: "center",
                    color: "green",
                  }}
                >
                </s.TextTitle>

                <s.TextDescription
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  Excluding gas fees.
                </s.TextDescription> */}


                        <s.SpacerSmall />
                        {blockchain.account === "" ||
                          blockchain.smartContract === null ? (
                          <s.Container ai={"center"} jc={"center"}>
                            {/* <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                      Connect to the {CONFIG.NETWORK.NAME} network
                    </s.TextDescription> */}
                            <s.SpacerSmall />
                            <Frame
                              animate
                              level={3}
                              corners={10}
                              layer='primary'
                              disabled={claimingNft ? 1 : 0}
                              onClick={(e) => {
                                e.preventDefault();
                                dispatch(connect());
                                getData();
                              }}
                            >
                              <span style={{ padding: '20px 30px', }}>CONNECT TO THE NEXUS CORE</span>
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
                            <Words>{data.totalSupply} / {CONFIG.MAX_SUPPLY}</Words>

                            <s.TextDescription
                              style={{
                                textAlign: "center",
                                color: "var(--accent-text)",
                              }}
                            >
                              {feedback}
                            </s.TextDescription>
                            <Loading />


                            <s.SpacerMedium />

                            <s.Container ai={'center'} jc={'center'} fd={'row'} style={{ width: 125 }}>
                              <Button animate
                                layer="alert"
                                disabled={claimingNft ? 1 : 0}
                                onClick={(e) => {
                                  e.preventDefault();
                                  decrementMintAmount();
                                }}
                              >
                                <FaMinus size={15} />
                              </Button>

                              <s.TextDescription
                                style={{
                                  padding: '0 20px', // Add padding to create spacing around the mint amount
                                  textAlign: 'center',
                                  color: 'var(--accent-text)',
                                  fontSize: 25,
                                }}
                              >
                                {mintAmount}
                              </s.TextDescription>

                              <Button animate
                                layer="success"
                                disabled={claimingNft ? 1 : 0}
                                onClick={(e) => {
                                  e.preventDefault();
                                  incrementMintAmount();
                                }}
                              >
                                <FaPlus size={15} />
                              </Button>
                            </s.Container>

                            <s.SpacerSmall />

                            <s.Container ai={'center'} jc={'center'} fd={'row'}>
                              <Frame
                                animate
                                level={3}
                                corners={5}
                                layer='primary'
                                disabled={claimingNft ? 1 : 0}
                                onClick={(e) => {
                                  e.preventDefault();
                                  claimNFTs();
                                  getData();
                                  clickAudio.play();
                                }}
                              >
                                <span style={{ padding: '20px 30px', }}>{claimingNft ? 'ASCENDING!' : 'MINT'}</span>
                              </Frame>
                            </s.Container>


                            <s.SpacerSmall />

                          </>
                        )}
                      </>
                    )}
                    <s.SpacerMedium />

                  </s.Container>

                  <StyledLink target={"_blank"} href={CONFIG.SCAN_LINK} onClick={(e) => { clickAudio.play(); }}>
                    See The Nexus Ethereals Contract
                  </StyledLink>

                  <br />

                  <a rel="noopener noreferrer" target={"_blank"} href="https://apothem.viewer.thenexusportal.io/">
                    <Logo animate size={100} onClick={(e) => { clickAudio.play(); }} />
                  </a>
                  <br />

                  <StyledLink target={"_blank"} href={"https://apothem.viewer.thenexusportal.io/"} onClick={(e) => { clickAudio.play(); }}>
                    {"SEE YOUR NEXUS ETHEREALS"}
                  </StyledLink>
                  <br />
                  <s.Container flex={1} jc={"center"} ai={"center"} >
                    <StyledImg alt={"previewgif"} src={"/config/images/preview.gif"} target={"_blank"} href={"https://apothem.viewer.thenexusportal.io/"} />
                  </s.Container>


                </s.Container>
              </ResponsiveWrapper>
            </s.Screen >
          </Frame>
        </Arwes>
      </SoundsProvider>

    </ThemeProvider>

  );
}

export default App;

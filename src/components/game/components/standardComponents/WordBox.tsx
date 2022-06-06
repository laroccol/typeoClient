import React from "react";
import Follower from "../../feedback/Follower";
import { Box } from "@mui/material";
import { styled } from "@mui/system";

interface Props {
  words: Array<string>;
  boxRef: React.MutableRefObject<any>;
}

const StyledTextArea = styled("div")(({ theme }) => ({
  position: "relative",
  display: "inline-block",
  fontSize: "20pt",
  lineHeight: "1.25em",
  textAlign: "left",
}));

const StyledWord = styled("div")(({ theme }) => ({
  display: "inline-block",
  padding: "0 0",
}));

class WordBox extends React.PureComponent<Props> {
  render() {
    const { words, boxRef } = this.props;
    let char_count = 0;
    return (
      <Box m={5} overflow="hidden" height="7.5em" fontSize="20pt">
        <StyledTextArea ref={boxRef}>
          {words.map((word, index) => {
            return (
              <StyledWord key={char_count++}>
                {word.split("").map((letter, index) => {
                  return (
                    <div
                      key={char_count++}
                      style={{ display: "inline-block" }}
                      //ref={char_count === currentCharIndex ? measuredRef : null}
                    >
                      {letter}
                    </div>
                  );
                })}
                <div
                  style={{ display: "inline-block" }}
                  //ref={char_count + 1 === currentCharIndex ? measuredRef : null}
                >
                  &nbsp;
                </div>
              </StyledWord>
            );
          })}
        </StyledTextArea>
      </Box>
    );
  }
}

export default WordBox;

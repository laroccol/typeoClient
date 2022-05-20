import React from "react";
import { keyframes } from "@mui/system";
import { Box, Container } from "@mui/material";

function usePrevious(value: any) {
  const ref = React.useRef();
  React.useEffect(() => {
    ref.current = value; //assign the value of ref to the argument
  }, [value]); //this code will run when the value of 'value' changes
  return ref.current; //in the end, return the current ref value.
}

interface FollowerProps {
  ccol: number;
  ccot: number;
  ccw: number;
}

const Follower = (props: FollowerProps) => {
  const prevCCOL = usePrevious(props.ccol);
  const prevCCW = usePrevious(props.ccw);

  const followerSlide = keyframes`
    from {
      left: ${prevCCOL}px;
      width: ${prevCCW}px
    }
    to {
      left: ${props.ccol}px;
    }
  `;

  const styles = {
    follower: {
      marginTop: "-2.5px",
      position: "absolute",
      left: `${props.ccol}px`,
      top: `${props.ccot}px`,
      width: `${props.ccw}px`,
      minHeight: "42px",
      backgroundColor: "rgba(158, 219, 145, 0.3)",
      animation: `${followerSlide} ${
        !prevCCOL ? 0.15 : prevCCOL || 0 > props.ccol ? 0.15 : 0.09
      }s`,
    },
  };

  return <Box sx={styles.follower}></Box>;
};

export default React.memo(Follower);

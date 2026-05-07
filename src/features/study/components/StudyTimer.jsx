import React, { useState, useEffect } from "react";
import { Flex, Text, Icon } from "@chakra-ui/react";
import { FiClock } from "react-icons/fi";
import { calcQualityByTime } from "../../../shared/utils/calcQualityByTime.js";

const StudyTimer = ({ startTime, isRunning, stoppedTimeMs }) => {
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        let timerId;
        if (isRunning) {
            timerId = setInterval(() => {
                setNow(Date.now());
            }, 100);
        }
        return () => clearInterval(timerId);
    }, [isRunning]);

    // Use stoppedTimeMs if provided (when user submitted), else calculate from now
    const elapsedMs = isRunning ? (now - startTime) : (stoppedTimeMs || (now - startTime));
    
    // Always calculate quality based on 'true' correctness just to show the timer color
    const currentQuality = calcQualityByTime(true, elapsedMs);

    let color = "gray.500";
    if (currentQuality === "EASY") color = "green.500";
    else if (currentQuality === "GOOD") color = "blue.500";
    else if (currentQuality === "HARD") color = "orange.500";
    else color = "red.500";

    const seconds = (elapsedMs / 1000).toFixed(1);

    return (
        <Flex 
            align="center" 
            gap={1.5} 
            color={color} 
            bg={`${color.split('.')[0]}.50`} 
            px={3} 
            py={1.5} 
            borderRadius="full" 
            borderWidth="1px" 
            borderColor={`${color.split('.')[0]}.200`} 
            _dark={{ bg: `${color.split('.')[0]}.900/20` }}
            transition="all 0.2s"
            shadow="sm"
        >
            <Icon as={FiClock} />
            <Text fontSize="sm" fontWeight="900" fontFamily="monospace" minW="40px" textAlign="right">
                {seconds}s
            </Text>
            <Flex 
                align="center" 
                justify="center" 
                bg={`${color.split('.')[0]}.100`} 
                _dark={{ bg: `${color.split('.')[0]}.800/40` }}
                px={2} 
                py={0.5} 
                borderRadius="md"
            >
                <Text fontSize="xs" fontWeight="900" textTransform="uppercase" letterSpacing="wide">
                    {currentQuality}
                </Text>
            </Flex>
        </Flex>
    );
};

export default StudyTimer;

import { useEffect, useState } from 'react';

function PMNumberBox({ initialValue, minValue, maxValue, increment }) {
    useEffect(() => {
        if (increment > (maxValue - minValue)) {
            console.error("increment cannot be larger than the distance between the maximum number and minimum number");
            return <p>inporperlyFormatted</p>
        }
        if (initialValue > maxValue || initialValue < minValue) {
            console.error("cannot have an intial value outside the bounds of the minimum and maximum values (inclusive)");
            return <p>inporperlyFormatted</p>
        }
        if (initialValue == minValue) {document.getElementById("decrementNumberButton").disabled=true;}
        if (initialValue == maxValue) {document.getElementById("incrementNumberButton").disabled=true;}
        console.log("initialValue", initialValue, "minValue", minValue, "maxValue", maxValue, "increment", increment);
    }, [initialValue, minValue, maxValue, increment]);

    const [number_value, setNumberValue] = useState(initialValue);

    function incrementNumber() {
        if ((number_value >= minValue) && (number_value < (minValue + increment))) {
            document.getElementById("decrementNumberButton").disabled=false;
        }
        if (number_value + increment <= maxValue) {
            if ((number_value+increment) >= maxValue) {
                document.getElementById("incrementNumberButton").disabled=true;
            }
            setNumberValue(number_value + increment);
        }
    }

    function decrementNumber() {
        if ((number_value <= (maxValue)) && (number_value > (maxValue - increment))) {
            document.getElementById("incrementNumberButton").disabled=false;
        };
        if (number_value - increment >= minValue) {
            if ((number_value-increment) <= minValue) {
                document.getElementById("decrementNumberButton").disabled=true;
            }
            setNumberValue(number_value - increment);
        }
    }

    return (
    <tr class="PMOverallLineBox">
        <div class="PMLabel PMElem">what doing there myu friend? can I help you to the car</div>
        <button class="PMButton PMElem" id="decrementNumberButton" onClick={decrementNumber}>-</button>
        <div class="PMVal PMElem">{number_value}</div>
        <button class="PMButton PMElem" id="incrementNumberButton" onClick={incrementNumber}>+</button>
    </tr>
    );
} export default PMNumberBox;

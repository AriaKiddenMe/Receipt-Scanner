import { useEffect, useState} from 'react';

function PMCounter({initialValue, minValue, maxValue, increment}) {
    const [number_value, setNumberValue] = useState(initialValue);
    const [can_inc, setCanInc] = useState(number_value+increment<=maxValue);
    const [can_dec, setCanDec] = useState(number_value-increment>=minValue);
    useEffect(() => {
        if (increment > (maxValue - minValue)) {
            console.error("increment cannot be larger than the distance between the maximum number and minimum number");
            return <p>inporperlyFormatted</p>
        }
        if (initialValue > maxValue || initialValue < minValue) {
            console.error("cannot have an intial value outside the bounds of the minimum (",minValue,") and maximum (",maxValue,") values (inclusive). Given ",initialValue);
            return <p>inporperlyFormatted</p>
        }
        if (initialValue===minValue) {setCanDec(false)}
        if (initialValue===maxValue) {setCanInc(false)}
    }, [initialValue, minValue, maxValue, increment]);


    function incrementNumber() {
        if ((number_value + increment) <= maxValue) {
            if(number_value >= minValue) {setCanDec(true)};
            if ((number_value+(2*increment)) > maxValue) {
                setCanInc(false);
            }
            setNumberValue(number_value + increment);
        } else {
            if ((number_value-increment) >= minValue) {
                setCanDec(true);
            }
        }
    }

    function decrementNumber() {
        if (number_value - increment >= minValue) {
            if (number_value <= maxValue) { setCanInc(true)};
            if ((number_value-(2*increment)) < minValue) {
                setCanDec(false);
            }
            setNumberValue(number_value - increment);
        } else {
            if ((number_value+increment) <= maxValue) {
                setCanInc(true);
            };
        }
    }

    function updateValue(val){
        if (val < maxValue && val > minValue) {{setNumberValue(val); setCanInc(true)}; setCanDec(true)}
        if (val >= maxValue) {setNumberValue(maxValue); setCanInc(false); setCanDec(true)};
        if (val <= minValue) {setNumberValue(minValue); setCanDec(false); setCanInc(true)};
    }

    return (
    <div className="PMCounter">
        <button className="PMButton PMElem" onClick={decrementNumber} disabled={!can_dec}>-</button>
        <input value={number_value} type="text" onChange={(e) => updateValue(e.target.value)} className="PMVal PMElem"/>
        <button className="PMButton PMElem" onClick={incrementNumber} disabled={!can_inc}>+</button>
    </div>
    );
} export default PMCounter;

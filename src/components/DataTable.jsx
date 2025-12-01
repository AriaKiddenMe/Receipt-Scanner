const DataTable = ({data, column}) =>{
    return <table>
        <thead>
            {(column <= 0)? (
                <tr>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                </tr>
            ):(
                <tr>{
                    column.map((item, index) => <TableHeadItem item={item}/>)}
                </tr>
            )}
        </thead>
        <tbody>
        {(data.length <= 0)? (
            <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
            </tr>
        ):(
            data.map((item, index) => <TableRow item={item} column={column}/>)
        )}
        </tbody>
    </table>
};

const TableHeadItem = ({item }) => <th>{item.heading}</th>;
const TableRow = ({item, column}) => {
    console.log(item);
    // <tr>{item.project_name}</tr>
    return <tr>
        {column.map((columnItem, index) =>{

            if(columnItem.value.includes('.')){
                const itemSplit = columnItem.value.split(".") //[object, field]
                return <td>{getProperties(item,itemSplit)}</td>
            }
            //else calls a primitive value stored in the object directly
            return <td>{item[`${columnItem.value}`]}</td>
        })}
    </tr>
};

function getProperties(item, itemCalls){
    let returnVal = '';

    for(let i = 1; i < itemCalls.length; i++){
        returnVal = returnVal.concat(' ' + item[itemCalls[0]][itemCalls[i]]);
    }
    return returnVal;
};

export default DataTable;

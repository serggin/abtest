import React, {useState, useEffect} from 'react';
import '../../assets/css/style.css';

import DatesTableRow from './DatesTableRow';
import {unixTimeToPattern} from '../utils';

const columns = {
  userId: 'UserId',
  regDate: 'Date Registration',
  lastDate: 'Date Last Activity',
};
export {columns};
const baseUrl = process.env.API_URL;

export default function DatesTable() {
  const emptyRow = ['', '', ''];
  const [rowsData, setRowsData] = useState([]);
  const [editKey, setEditKey] = useState(Date.now());
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState([]);
  const [calcValue, setCalcValue] = useState('');
  const [dbRows, setDbRows] = useState([]);
  const [readPending, setReadPending] = useState(false);

  useEffect(() => {
    if (readPending) {
      read();
      setReadPending(false);
    }
  }, [readPending]);

  const onRowDataFilled = (values) => {
    setRowsData([...rowsData, [values.userId, values.regDate, values.lastDate]]);
    setEditKey(Date.now());
    setEditing(false);
  }
  const validateUserId = (userId) => {
    return !rowsData.find(rowData => rowData[0] === userId);
  }
  const titles = Object.values(columns);
  const save = () => {
    fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rowsData)
    })
      .then(response => {
        if (response.status === 201) {
          setRowsData([]);
          setCalcValue('');
          setReadPending(true);
        } else {
          return response.json();
          const responseErrors = response.json();
          setErrors(responseErrors);
        }
      })
    ;
  }
  const calculate = () => {
    fetch(baseUrl + '/rolling-retention/7')
      .then(response => {
        const text = response.text();
        if (response.status === 200) {
          return text.then(value => {setCalcValue(value)});
        } else {
          return text.then(message => {setErrors([message])});
        }
      });
  }
  const read = () => {
    fetch(baseUrl)
      .then(response => {
        if (response.status === 200) {
          return response.json().then(rows => {
            const data = rows.map(rowObj => [
              rowObj.userid, unixTimeToPattern(rowObj.regdate), unixTimeToPattern(rowObj.lastdate)
            ]);
            setDbRows(data);
          })
        }
      });
  }
  const clear = () => {
    fetch(baseUrl, {
      method: 'DELETE'
    }).then(response => {
      if (response.status === 200) {
        setDbRows([]);
      } else {
        if (response.status === 500) {
          response.text().then(err => {
            setErrors([err]);
          })
        }
      }
    })

  }
  const enableSave = (editing) => {
    setEditing(editing );
  }
  return (
    <>
      <div className="dates-table">
        <div className="dates-table-header">
          <span className={"cell col0"}>{titles[0]}</span>
          <span className={"cell col1"}>{titles[1]}</span>
          <span className={"cell col2"}>{titles[2]}</span>
        </div>

        {rowsData.map((rowData) => (
          <DatesTableRow key={rowData[0].length == 0 ? '0' : rowData[0]}
            rowData={rowData}
            isEditable={false}/>
        ))}
        <DatesTableRow key={editKey}
                       rowData={emptyRow}
                       isEditable={true}
                       validateUserId={validateUserId}
                       onDataFilled={onRowDataFilled}
                       reportEditing={enableSave}/>
      </div>
      <div className="buttons">
        <button type="button" disabled={editing} onClick={save}>Save</button>
      </div>
      <div>
        {errors.map(error => <div className="error" key={error}>{error}</div>)}
      </div>
      <div className="buttons">
        <button type="button" onClick={calculate}>Calculate</button>
        <span className="calc-label"> Rolling Retention 7 day : </span>
        <span className="calc-value">{calcValue} {calcValue && Number(calcValue) ? ' %' : ''}</span>
      </div>
      <h2>Database content - for demo only!</h2>
      <div className="buttons">
        <button type="button" onClick={read}>Read</button>
        <button type="button" onClick={clear}>Clear</button>
      </div>
      <div className="dates-table">
        {dbRows.map((rowData) => (
          <DatesTableRow key={rowData[0]}
                         rowData={rowData}
                         isEditable={false}/>
        ))}
      </div>
    </>
  );
}

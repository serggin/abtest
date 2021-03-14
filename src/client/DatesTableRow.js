import React, {useState} from 'react';
import {useFormik} from 'formik';
import * as Yup from 'yup';

import '../../assets/css/style.css';
import {columns} from './DatesTable';
import {patternToDate} from '../utils';

function ReadOnlyRow({rowData}) {
  return (
    <div className="read-only-row">
      <span className={"cell col0"}>{rowData[0]}</span>
      <span className={"cell col1"}>{rowData[1]}</span>
      <span className={"cell col2"}>{rowData[2]}</span>
    </div>
  );
}

function EditRow({rowData, validateUserId, onDataFilled, reportEditing}) {
  const [editing, setEditing] = useState(false);
  const dateSchema = Yup.string()
    .required('Required')
    .matches(/\d\d\.\d\d\.\d\d\d\d/, 'Use pattern dd.mm.yyyy')
    .test('pattern', (value, context) => {
      const date = patternToDate(value);
      let message;
      if (date) {
        if (date <= (new Date())) {
          return true;
        }
        message = 'No future dates allowed';
      } else {
        message = 'Invalid date';
      }
      return context.createError({message: message});
    });
  const handleSubmit = (values, {setErrors}) => {
    const fieldErrors = {};
    if (!validateUserId(values.userId)) {
      fieldErrors.userId = `${formik.values.userId} is already used!`;
    }
    if (patternToDate(values.lastDate) < patternToDate(values.regDate)) {
      fieldErrors.lastDate = `${columns.lastDate} can't be earlier than ${columns.regDate}`;
    }
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
    } else {
      onDataFilled(values);
    }
  }
  const formik = useFormik({
    initialValues: {
      userId: rowData[0],
      regDate: rowData[1],
      lastDate: rowData[2]
    },
    validationSchema: Yup.object({
      userId: Yup.number()
        .typeError('Must be positive integer')
        .integer('Must be positive integer')
        .min(1, 'Must be positive integer')
        .required('Required'),
      regDate: dateSchema,
      lastDate: dateSchema,
    }),
    onSubmit: handleSubmit,
  });
  const handleChange = (e) => {
    formik.handleChange(e);
    const id = e.target.id;
    const isEditing = Object.keys(formik.values).reduce((acc, cur) => {
      return acc || cur === id ? e.target.value.length : formik.values[cur].length;
    }, false);
    reportEditing(isEditing);
    setEditing(isEditing);
  }
  const handleBlur = (e) => {
    formik.handleBlur(e);
    if (Object.keys(formik.errors).length === 0) {
      formik.submitForm();
    }
  }
  return (
    <>
      <form>
        <input id="userId" type="text" value={formik.values.userId}
               onChange={handleChange} onBlur={handleBlur}
               className="col0"
        />
        <input id="regDate" type="text" value={formik.values.regDate}
               onChange={handleChange} onBlur={handleBlur}
               className="col1"
               placeholder="dd.mm.yyyy"
        />
        <input id="lastDate" type="text" value={formik.values.lastDate}
               onChange={handleChange} onBlur={handleBlur}
               className="col2"
               placeholder="dd.mm.yyyy"
        />
      </form>
      {Object.keys(formik.errors).length > 0 &&
        Object.keys(formik.errors).map((key) => (
          formik.touched[key] &&
            <div className="error" key={key}>
              <b>{`${columns[key]}`}</b>
              {`: ${formik.errors[key]}`}
            </div>

        ))
      }
      {!editing &&
        <div className="info">Fill in all fields and exit Editing mode by mouse or key Tab</div>
      }
    </>
  );
}

export default function DatesTableRow({rowData, isEditable, validateUserId, onDataFilled, reportEditing}) {
  return (
    <div className="dates-table-row">
      {!isEditable &&
        <ReadOnlyRow rowData={rowData} />
      }
      {isEditable &&
        <EditRow rowData={rowData} validateUserId={validateUserId} onDataFilled={onDataFilled} reportEditing={reportEditing}/>
      }
    </div>
  );
}

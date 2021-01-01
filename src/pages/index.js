import React, { useState } from 'react';
import { Pagination, Dropdown, Menu, Modal, Switch, Cascader, Input, Button, Tooltip } from 'antd';
import SalaryExcel from '../components/SalaryExcel';
import ss from './index.less';
import {
  columns,
  dataSource,
  //  columns2
} from '../assets/data/excel';

export default function () {
  const [curColumns, setcurColumns] = useState(columns);
  const [curData, setcurData] = useState(dataSource);

  const handle1 = () => {
    setcurColumns(columns);
    setcurData(dataSource);
  };

  const handle2 = () => {
    setcurColumns([]);
    setcurData([]);
  };

  return (
    <div className={ss.normal}>
      <div className={ss.btnBox}>
        <Button onClick={handle1}>100000条数据</Button>
        <Button onClick={handle2}>空白表</Button>
      </div>
      <SalaryExcel
        antd={{
          Pagination,
          Dropdown,
          Menu,
          Modal,
          Switch,
          Cascader,
          Input,
          Tooltip,
          Button,
        }}
        columns={curColumns}
        dataSource={curData}
        height={window.innerHeight - 400}
        width={window.innerWidth - 300}
      />
    </div>
  );
}

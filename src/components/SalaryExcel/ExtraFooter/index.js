import React, { useContext } from 'react';
import ss from './index.less';
import { paginationDefault, mgBT } from '../utils/config';
import { ExcelContext } from '../index';

export default function Index(props) {
  const { width, dataSource } = props;
  const { Pagination } = useContext(ExcelContext);

  return (
    <div className={ss.excelExtraFooter} style={{ width, height: mgBT }}>
      <div>总数：{dataSource.length}</div>
      <Pagination pageSize={30} total={10000} {...paginationDefault} />
    </div>
  );
}

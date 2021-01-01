import React from 'react';
import './index.less';
import { Item } from '../item';

// 网格
const GridColumn = (props) => {
  const {
    rowIndex,
    columnIndex,
    style,
    dataSource,
    columnInfo,
    changeTable,
    changeColumns,
  } = props;
  const tmp = columnInfo.noFixed.data[columnIndex];
  const obj = dataSource[rowIndex];
  return (
    <div style={style}>
      <Item
        data={obj}
        {...tmp}
        change={changeTable}
        changeColumns={changeColumns}
        source={dataSource}
        rowIndex={rowIndex}
        columnInfo={columnInfo}
      />
    </div>
  );
};

export default GridColumn;

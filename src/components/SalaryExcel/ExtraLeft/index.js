import React, { useContext } from 'react';
import { getIcon } from '../utils/tools';
import { ExcelContext } from '../index';
import ss from './index.less';

export default function Index(props) {
  const { extraLeftRef, dataSource, changeTable } = props;

  const { Menu, Dropdown, Modal } = useContext(ExcelContext);
  const index = () => +extraLeftRef.current.dataset.tmp;

  const handleAdd = () => {
    dataSource.splice(index() + 1, 0, {
      rowKeyIdSp: +new Date(),
    });
    changeTable(dataSource);
  };

  const menuClick = (e) => {
    if (e.key === 'up') {
      dataSource.splice(index(), 0, {
        rowKeyIdSp: +new Date(),
      });
      changeTable(dataSource);
    } else if (e.key === 'bottom') {
      dataSource.splice(index() + 1, 0, { rowKeyIdSp: +new Date() });
      changeTable(dataSource);
    } else if (e.key === 'del') {
      Modal.confirm({
        title: '是否删除',
        content: '删除后不能恢复',
        okText: '确定',
        okType: 'danger',
        cancelText: '取消',
        onOk: () => {
          dataSource.splice(index(), 1);
          changeTable(dataSource);
        },
        onCancel() {},
      });
    }
    extraLeftRef.current.style.opacity = 0;
  };

  const onVisibleChange = (visible) => {
    extraLeftRef.current.style.opacity = +visible;
  };

  const overlay = () => {
    return (
      <Menu onClick={menuClick}>
        <Menu.Item key="up">上面插入一行</Menu.Item>
        <Menu.Item key="bottom">下面插入一行</Menu.Item>
        {dataSource.length > 1 && <Menu.Item key="del">删除</Menu.Item>}
      </Menu>
    );
  };
  return (
    <div className={ss.operateBox} ref={extraLeftRef}>
      <div className={ss.btn} onClick={handleAdd}>
        {getIcon('add')}
      </div>
      <Dropdown overlay={overlay} placement="bottomCenter" onVisibleChange={onVisibleChange}>
        <div className={ss.btn}>{getIcon('drag')}</div>
      </Dropdown>
    </div>
  );
}

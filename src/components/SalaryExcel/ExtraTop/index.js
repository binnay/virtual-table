import React, { useState, useContext } from 'react';
import ss from './index.less';
import { mgTP, fixColOptions } from '../utils/config';
import { getIcon } from '../utils/tools';
import { ExcelContext } from '../index';
import classnames from 'classnames';

export default function index(props) {
  const {
    triggerFull,
    isFull,
    width,
    columnInfo,
    changeColumns = () => {},
    changeFixStatus = () => {},
  } = props;
  const { columnsWithHide: columns, labelValueArray } = columnInfo;

  const handleHideShowFields = (index, childrenIndex, isOpen) => {
    if (childrenIndex === undefined) {
      columns[index].isShow = !isOpen;
    } else {
      columns[index].children[childrenIndex].isShow = !isOpen;
    }
    changeColumns(columns, index);
  };

  const handleFixCol = (type, value) => {
    changeFixStatus(type, value);
  };

  return (
    <div className={ss.operateBox} style={{ width, height: mgTP }}>
      <div className={ss.left}>核算清单...</div>
      <div className={ss.right}>
        <FixCol change={handleFixCol} columns={columns} />
        <HideShowFields source={labelValueArray} change={handleHideShowFields} />
        <FullScreen isFull={isFull} onClick={triggerFull} />
      </div>
    </div>
  );
}

// 固定列
const FixCol = ({ change, columns = [] }) => {
  const { Cascader, Tooltip } = useContext(ExcelContext);

  const getValue = ([type, value]) => {
    change(type, value);
  };

  // 模板
  const item = (disabled) => (
    <div
      className={classnames(ss.iconBox, {
        [ss.iconBoxDisabled]: disabled,
      })}
    >
      {getIcon('lock')}
      <span>固定</span>
    </div>
  );

  if (columns.length < 10) {
    return <Tooltip title="字段超过10个可用">{item(true)}</Tooltip>;
  }

  return (
    <Cascader options={fixColOptions} popupClassName={ss.cascader} onChange={getValue}>
      {item()}
    </Cascader>
  );
};

// 显示隐藏字段按钮
const HideShowFields = (props) => {
  const [visible, setvisible] = useState(false);
  const { source = [], change = () => {} } = props;

  const { Dropdown, Switch, Menu, Tooltip } = useContext(ExcelContext);

  const show = () => {
    document.addEventListener('click', hide);
    setvisible(true);
  };
  const hide = () => {
    document.removeEventListener('click', hide);
    setvisible(false);
  };

  const handleClick = () => {
    if (!visible) {
      show();
    } else {
      hide();
    }
  };

  const switchChange = (index, childrenIndex, open) => (event) => {
    stopPropagation(event);
    change(index, childrenIndex, open);
  };

  // 阻止冒泡事件
  const stopPropagation = (e) => {
    e.nativeEvent.stopImmediatePropagation();
  };

  const overlay = () => {
    return (
      <Menu className={ss.menuContentBox}>
        {source.map(({ label, value, children, open }, index) =>
          children ? (
            children.map((v, i) => (
              <Menu.Item key={v.value} className={ss.item}>
                {v.label}
                <div onClick={switchChange(index, i, v.open)}>
                  <Switch checked={v.open} size="small" />
                </div>
              </Menu.Item>
            ))
          ) : (
            <Menu.Item key={value} className={ss.item}>
              {label}
              <div onClick={switchChange(index, undefined, open)}>
                <Switch checked={open} size="small" />
              </div>
            </Menu.Item>
          ),
        )}
      </Menu>
    );
  };

  const item = (disabled) => (
    <div
      className={classnames(ss.iconBox, {
        [ss.iconBoxDisabled]: disabled,
      })}
      onClick={handleClick}
    >
      {getIcon('table')}
      <span>字段</span>
    </div>
  );

  if (source.length === 0) {
    return <Tooltip title="暂无字段">{item(true)}</Tooltip>;
  }

  return (
    <Dropdown
      overlayClassName={ss.dropdownClass}
      overlay={overlay}
      placement="bottomCenter"
      visible={visible}
    >
      {item()}
    </Dropdown>
  );
};

// 全屏和退出全屏按钮
const FullScreen = (props) => {
  const { isFull, onClick = () => {} } = props;
  return (
    <div className={ss.iconBox} onClick={onClick}>
      {getIcon('full')}
      <span>{!isFull ? '全屏' : '退出全屏'}</span>
    </div>
  );
};

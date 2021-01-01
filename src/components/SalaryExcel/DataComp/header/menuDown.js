import React, { useContext, useEffect, useState, cloneElement, useCallback } from 'react';
import { ExcelContext } from '../../index';
import { getColMenus, changeTableColumns, getIcon } from '../../utils/tools';
import ss from './menuDown.less';
import { typeColMenu } from '../../utils/config';

export default function Index(props) {
  const {
    children,
    isFixCol,
    name,
    change,
    changeTable,
    changeIndex,
    index,
    data,
    dataSource,
    currentData,
  } = props;
  const { valueType, dataIndex } = currentData;
  const { Menu, Dropdown, Input, Modal } = useContext(ExcelContext);
  // =============================================== useState ===============================================
  const [visible, setvisible] = useState(false);
  const [innName, setInnName] = useState('');

  // =============================================== function ===============================================
  const show = () => {
    setvisible(true);
  };

  // useCallback不能移除，否则事件无法移除
  const hide = useCallback(() => {
    setvisible(false);
  }, []);

  // =============================================== useEffect ===============================================
  useEffect(() => {
    setInnName(JSON.parse(JSON.stringify(name)));
  }, [name]);

  useEffect(() => {
    if (!visible && name !== innName) {
      // 弹窗关闭，并且内部名字和外部入参名不一致时，需要调整外部入参名
      if (innName.length > 0) {
        const { result } = changeTableColumns({
          data,
          changeIndex,
          index,
          type: 'title',
          value: innName,
        });
        change(result, index);
      } else {
        setInnName(name);
      }
    }

    if (visible) {
      document.addEventListener('click', hide, false);
    } else {
      document.removeEventListener('click', hide, false);
    }
    return () => {
      document.removeEventListener('click', hide, false);
    };
  }, [visible, data, changeIndex, index, innName, change, name, hide]);

  // =============================================== function ===============================================

  const handleClick = (e) => {
    if (!visible) {
      show();
    } else {
      hide();
    }
  };

  // 输入框变化，回调
  const inputChange = (e) => {
    setInnName(e.target.value);
  };

  // 阻止冒泡事件
  const stopPropagation = (e) => {
    e.nativeEvent.stopImmediatePropagation();
  };

  // menu菜单阻止冒泡事件
  const menuStopPropagation = (e) => {
    stopPropagation(e.domEvent);
  };

  // menu菜单点击
  const menuClick = (e) => {
    switch (e.key) {
      case 'insertAfter':
      case 'insertBefore':
        const { key, result } = changeTableColumns({
          data,
          index,
          changeIndex,
        });
        if (key.length === 1) {
          result.splice(e.key === 'insertBefore' ? key[0] : key[0] + 1, 0, {
            dataIndex: +new Date(),
            title: 'column',
          });
        } else {
          result[key[0]].children.splice(e.key === 'insertBefore' ? key[1] : key[1] + 1, 0, {
            dataIndex: +new Date(),
            title: 'column',
          });
        }
        change(result, e.key === 'insertBefore' ? index - 1 : index);
        break;
      case 'del':
        Modal.confirm({
          title: '是否删除',
          content: '删除后不能恢复',
          okText: '确定',
          okType: 'danger',
          cancelText: '取消',
          onOk: () => {
            const delRes = changeTableColumns({
              data,
              index,
              changeIndex,
            });
            if (delRes.key.length === 1) {
              delRes.result.splice(delRes.key[0], 1);
            } else {
              delRes.result[delRes.key[0]].children.splice(delRes.key[1], 1);
            }
            change(delRes.result, index);
          },
          onCancel() {},
        });
        break;
      case 'subChildren':
        const subRes = changeTableColumns({
          data,
          index,
          changeIndex,
        });
        if (subRes.key.length === 1) {
          if (subRes.result[subRes.key[0]].children) {
            subRes.result[subRes.key[0]].children.push({
              dataIndex: +new Date(),
              title: 'column',
            });
          } else {
            subRes.result[subRes.key[0]].children = [
              {
                dataIndex: +new Date(),
                title: 'column',
              },
            ];
          }
        }
        change(subRes.result, index);
        break;
      default:
        if (e.keyPath.includes('fieldsTypes')) {
          // 如果是数字，校验整列数据
          if (e.key === 'number') {
            dataSource.forEach((v) => {
              if (!/^(\-)?\d{1,8}(\.\d{0,10})?$/.test(v[dataIndex])) {
                v[dataIndex] = '';
              }
            });
            changeTable(dataSource);
          }
          if (e.key === 'formula' && valueType !== 'formula') {
            dataSource.forEach((v) => (v[dataIndex] = ''));
            changeTable(dataSource);
          }
          const { result } = changeTableColumns({
            data,
            index,
            changeIndex,
            type: 'valueType',
            value: e.key,
          });
          change(result, index);
        }
        break;
    }
  };

  // 获取当前字段数据类型
  const getCurrentFieldsType = () => {
    if (!valueType) {
      return '文本';
    } else {
      let tmp = '';
      typeColMenu.forEach(({ label, value, children }) => {
        if (value === valueType) {
          tmp = label;
        }
        if (children && !tmp) {
          children.forEach((v) => {
            if (v.value === valueType) {
              tmp = label + '/' + v.label;
            }
          });
        }
      });
      return tmp;
    }
  };

  // menu菜单，这个菜单中，如果想要在点击时不能关闭，需要阻止冒泡事件
  const overlay = () => {
    return (
      <Menu onClick={menuClick}>
        {/* ================= 修改名称 ================= */}
        <Menu.Item>
          <div onClick={stopPropagation}>
            <Input value={innName} onChange={inputChange} onPressEnter={hide} placeholder={name} />
          </div>
        </Menu.Item>
        {/* ================= 修改类型 ================= */}
        <Menu.SubMenu
          title={'类型: ' + getCurrentFieldsType()}
          onTitleClick={menuStopPropagation}
          key="fieldsTypes"
        >
          {typeColMenu.map(({ label, value, children }) =>
            !children ? (
              <Menu.Item key={value}>{label}</Menu.Item>
            ) : (
              <Menu.SubMenu title={label} key={value} onTitleClick={menuStopPropagation}>
                {children.map((v) => (
                  <Menu.Item key={v.value}>{v.label}</Menu.Item>
                ))}
              </Menu.SubMenu>
            ),
          )}
        </Menu.SubMenu>
        {/* ================= 操纵表头 ================= */}
        {getColMenus(!isFixCol).map(({ label, value }) => (
          <Menu.Item key={value}>{label}</Menu.Item>
        ))}
        {/* 插入子菜单 */}
        {changeIndex === 'main' && <Menu.Item key="subChildren">添加子菜单</Menu.Item>}
      </Menu>
    );
  };

  const handleClickAddNew = () => {
    const { columnsWithHide } = data;
    columnsWithHide.push({
      dataIndex: +new Date(),
      title: 'column',
    });
    change(columnsWithHide, index);
  };

  // =============================================== render ===============================================
  if (currentData.dataIndex === 'addBtnSp') {
    return cloneElement(children.props.children, {
      onClick: handleClickAddNew,
      children: getIcon('add'),
      className: `${ss.addBtnSpn} ${children.props.children.props.className}`,
    });
  }
  return (
    <Dropdown overlay={overlay} visible={visible}>
      {cloneElement(children, {
        onClick: handleClick,
      })}
    </Dropdown>
  );
}

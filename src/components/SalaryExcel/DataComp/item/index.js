import React, { useContext, useState, useEffect, useCallback, useRef } from 'react';
import ss from './index.less';
import { ExcelContext } from '../../index';
import { createPortal } from 'react-dom';
import { excelClassName } from '../../utils/config';
import classnames from 'classnames';

/**
 * 所有单元格cell都使用这个组件
 * @param {*} props
 */
export const Item = (props) => {
  const {
    data,
    dataIndex,
    width,
    children,
    change,
    changeColumns,
    source,
    rowIndex,
    valueType,
    columnInfo,
    formula,
  } = props;
  const { extraLeftRef } = useContext(ExcelContext);

  const mouseEnter = (e) => {
    const { top } = e.target.getBoundingClientRect();
    extraLeftRef.current.style.top = `${top}px`;
    extraLeftRef.current.dataset.tmp = rowIndex;
    extraLeftRef.current.style.opacity = 1;
  };
  const mouseLeave = () => {
    extraLeftRef.current.style.opacity = 0;
  };

  if (dataIndex === 'addBtnSp') {
    return (
      <div className={ss.dataItemAddBtnData} onMouseEnter={mouseEnter} onMouseLeave={mouseLeave} />
    );
  }

  const getLabel = (formula, dataIndex) => {
    let result = data[dataIndex];
    let tmp = '';
    if (formula) {
      result = '';
      formula.forEach((v) => {
        if (v.type === 'tag') {
          tmp += data[v.data.dataIndex];
        } else {
          tmp += v.data.title;
        }
      });
      try {
        const regEx = /[\<br\/\>|&nbsp;|\/n|\/r]/g;
        tmp.replace(regEx, '');
        result = eval(tmp.replace(regEx, ''));
      } catch (error) {
        // console.log(error);
      }
    }

    return result;
  };

  if (children) {
    return (
      <div className={ss.dataItemBox}>
        {children.map((v, i) => (
          <Template
            key={v.dataIndex}
            width={v.width}
            label={getLabel(v.formula, v.dataIndex)}
            dataIndex={v.dataIndex}
            valueType={v.valueType}
            change={change}
            changeColumns={changeColumns}
            source={source}
            columnInfo={columnInfo}
            data={data}
            onMouseEnter={mouseEnter}
            onMouseLeave={mouseLeave}
            formula={v.formula}
            left={() => {
              if (i === 0) return 0;
              const tmpAry = children.slice(0, i).map((v) => v.width);
              const totalTmp = tmpAry.reduce((pre, current) => (pre += current));
              return totalTmp;
            }}
          />
        ))}
      </div>
    );
  }
  return (
    <Template
      width={width}
      label={getLabel(formula, dataIndex)}
      dataIndex={dataIndex}
      valueType={valueType}
      columnInfo={columnInfo}
      change={change}
      changeColumns={changeColumns}
      source={source}
      data={data}
      left={() => 0}
      onMouseEnter={mouseEnter}
      onMouseLeave={mouseLeave}
      formula={formula}
    />
  );
};

function Template(props) {
  const {
    width,
    label,
    dataIndex,
    valueType,
    columnInfo,
    change,
    changeColumns,
    source,
    data,
    left,
    onMouseEnter,
    onMouseLeave,
    formula,
  } = props;
  const style = { width };
  const excelBoxDom = document.getElementsByClassName(excelClassName)[0];

  const { Input } = useContext(ExcelContext);
  const textAreaRef = useRef(null);

  // =========================================== useState ===========================================
  const [visible, setvisible] = useState(false);
  const [selected, setselected] = useState(false);
  const [value, setvalue] = useState('');
  const [pInfo, setpInfo] = useState({});

  // =========================================== function ===========================================
  // 显示输入框
  const show = () => {
    setvisible(true);
    setselected(false);
  };

  // 隐藏输入框，useCallback不能去
  const hide = useCallback(() => {
    setvisible(false);
  }, []);

  // 显示聚焦选中框
  const showSelected = () => {
    setselected(true);
  };

  // 隐藏聚焦聚焦选中框
  const hideSelected = useCallback(() => {
    setselected(false);
  }, []);

  // =========================================== useEffect ===========================================
  useEffect(() => {
    const hideCallback = () => {
      // 输入框消失后，更改数据源和重置初始状态
      if (!value) return;
      let tmp = true;
      if (valueType === 'number' && !/^(\-)?\d{1,8}(\.\d{0,10})?$/.test(value)) {
        tmp = false;
      }
      if (tmp) {
        const trueIndex = source.findIndex((v) => v.rowKeyIdSp === data.rowKeyIdSp);
        if (source[trueIndex][dataIndex] !== value) {
          source[trueIndex][dataIndex] = value;
          change(source);
        }
      }
      setvalue('');
    };

    if (visible) {
      excelBoxDom.addEventListener('scroll', hide);
      document.addEventListener('click', hide);
    } else {
      hideCallback();
      excelBoxDom && excelBoxDom.removeEventListener('scroll', hide);
      document.removeEventListener('click', hide);
    }
    return () => {
      excelBoxDom && excelBoxDom.removeEventListener('scroll', hide);
      document.removeEventListener('click', hide);
    };
  }, [visible, hide, excelBoxDom, change, data, source, dataIndex, value, valueType]);

  useEffect(() => {
    if (selected) {
      document.addEventListener('click', hideSelected);
    } else {
      document.removeEventListener('click', hideSelected);
    }
    return () => {
      document.removeEventListener('click', hideSelected);
    };
  }, [selected, hideSelected]);

  // =========================================== function ===========================================
  // 双击div
  const doubleClick = (e) => {
    if (visible) {
      hide();
    } else {
      const { top, left } = e.target.getBoundingClientRect();
      setpInfo({ top, left });
      show();
      if (valueType !== 'formula') {
        setTimeout(() => {
          textAreaRef.current.focus();
          setvalue(label);
        });
      }
    }
  };

  // 单机div
  const singleClick = (e) => {
    if (selected) {
      hideSelected();
    } else {
      showSelected();
    }
  };

  // 单机input，阻止事件冒泡
  const stopPFn = (e) => {
    e.nativeEvent.stopImmediatePropagation();
  };

  // input内容变化
  const inputChange = (e) => {
    setvalue(e.target.value);
  };

  const handleEditorOk = (value) => {
    const { columnsWithHide } = columnInfo;
    columnsWithHide.findIndex((v) => {
      if (v.children) {
        const childrenIndex = v.children.findIndex((vv) => {
          if (vv.dataIndex === dataIndex) {
            vv.formula = value;
          }
        });
        if (childrenIndex > -1) return true;
        else return false;
      } else {
        if (v.dataIndex === dataIndex) {
          v.formula = value;
          return true;
        } else {
          return false;
        }
      }
    });

    changeColumns(columnsWithHide);
    hide();
  };

  const seBox = () => {
    return (
      <>
        {/* 上 */}
        <div
          className={ss.dataLine}
          style={{
            height: 2,
            width,
            top: 0,
            left: left(),
          }}
        />
        {/* 下 */}
        <div
          className={ss.dataLine}
          style={{
            height: 2,
            width,
            bottom: 0,
            left: left(),
          }}
        />
        {/* 左 */}
        <div
          className={ss.dataLine}
          style={{
            width: 2,
            height: 32,
            top: 0,
            left: left(),
          }}
        />
        {/* 右 */}
        <div
          className={ss.dataLine}
          style={{
            width: 2,
            height: 32,
            left: left() + width - 2,
            top: 0,
          }}
        />
      </>
    );
  };

  const editorBox = () => {
    const style = (width) => ({
      ...pInfo,
      width,
    });
    return valueType === 'formula' ? (
      <div
        className={classnames(ss.dataInputBox, ss.dataInputBoxLarge)}
        style={style(450)}
        onClick={stopPFn}
      >
        <Editor columnInfo={columnInfo} onOk={handleEditorOk} value={formula} />
      </div>
    ) : (
      <div className={ss.dataInputBox} style={style(width)}>
        <Input.TextArea
          ref={textAreaRef}
          placeholder={label}
          value={value}
          autoSize={true}
          onClick={stopPFn}
          onChange={inputChange}
          onPressEnter={hide}
          bordered={0}
        />
      </div>
    );
  };

  // =========================================== render ===========================================
  return (
    <>
      {visible ? (
        <div style={style} />
      ) : (
        <div
          key={dataIndex}
          className={ss.dataItem}
          style={style}
          onClick={singleClick}
          onDoubleClick={doubleClick}
          onMouseLeave={onMouseLeave}
          onMouseEnter={onMouseEnter}
        >
          {label}
        </div>
      )}

      {selected && seBox()}

      <ModalContainer visible={visible}>{visible && editorBox()}</ModalContainer>
    </>
  );
}

let el = document.createElement('div');
let mounted = false;
function ModalContainer({ visible, children }) {
  useEffect(() => {
    if (visible) {
      document.body.appendChild(el);
      mounted = true;
    } else {
      clear();
    }
    return clear;
  }, [visible]);

  const clear = () => {
    if (mounted) {
      document.body.removeChild(el);
      el = document.createElement('div');
      mounted = false;
    }
  };
  if (!visible) return null;
  return createPortal(children, el);
}

let editorResult = [];
// 编辑框
const Editor = (props) => {
  const { columnInfo, value = [], onOk } = props;
  const { Button } = useContext(ExcelContext);
  const { columnsWithHide } = columnInfo;

  const [innValue, setinnValue] = useState(value);
  const [isFirstSet, setisFirstSet] = useState(true);

  // 初始化函数
  const set = (innValue, isChange, current) => {
    if (innValue.length && isChange) {
      const target = current || document.getElementById('yEditorId');
      let tmp = '';
      innValue.forEach(({ data, type }, i) => {
        const key = data.dataIndex || data.key;
        if (type === 'tag') {
          tmp += `<div class="${ss.assist}"></div><div contenteditable="false" data-id="${key}" class="${ss.tag}">${data.title}</div><div class="${ss.assist}"></div>`;
        } else {
          tmp += `<div class="${ss.assist}">${data.title}</div>`;
        }
      });
      if (tmp.length) {
        target.innerHTML = tmp;
      }
    }
  };

  // 获取输入框光标位置
  const getCursorPlace = (elementObj) => {
    const obj = document.getElementById('yEditorId');
    let range, node;

    if (window.getSelection && window.getSelection().getRangeAt) {
      range = window.getSelection().getRangeAt(0);
      range.collapse(false);
      node = range.createContextualFragment(elementObj);
      let c = node.lastChild;
      range.insertNode(node);
      if (c) {
        range.setEndAfter(c);
        range.setStartAfter(c);
      }
      let j = window.getSelection();
      j.removeAllRanges();
      j.addRange(range);
    } else if (document.selection && document.selection.createRange) {
      document.selection.createRange().pasteHTML(elementObj);
    }
  };

  // 递归解析内容
  const getResult = (obj) => {
    obj.forEach((element) => {
      // 标签
      if (element.contentEditable === 'false') {
        let fatherIndex = -1;
        let childrenIndex = -1;
        for (let i = 0; columnsWithHide.length; i++) {
          const fatherKey = columnsWithHide[i].dataIndex || columnsWithHide[i].key;
          if (fatherKey === element.dataset.id) {
            fatherIndex = i;
            break;
          }
          if (columnsWithHide[i].children && columnsWithHide[i].children.length) {
            for (let j = 0; columnsWithHide[i].children.length; j++) {
              const childrenKey =
                columnsWithHide[i].children[j].dataIndex || columnsWithHide[i].children[j].key;
              if (childrenKey === element.dataset.id) {
                fatherIndex = i;
                childrenIndex = j;
                break;
              }
            }
          }
        }
        editorResult.push({
          type: 'tag',
          source: columnsWithHide[fatherIndex],
          index: childrenIndex === -1 ? undefined : childrenIndex,
          data:
            childrenIndex === -1
              ? columnsWithHide[fatherIndex]
              : columnsWithHide[fatherIndex][childrenIndex],
        });
        return;
      }
      // 有子节点，但是自由一个子节点，并且是个text内容
      if (element.nodeType === 3) {
        editorResult.push({
          type: 'normal',
          data: {
            title: element.nodeValue,
            dataIndex: Math.random(),
          },
        });
        return;
      }
      if (element.childNodes.length) {
        getResult(element.childNodes);
      }
    });

    const resultFilter = editorResult.filter((v) => {
      if (!v) return false;
      if (!v.data.title) return false;
      return true;
    });
  };

  // 获取递归结果
  const getResultResult = () => {
    editorResult = [];
    getResult(document.getElementById('yEditorId').childNodes);
    setinnValue(editorResult);
  };

  // 点击标签
  const tagItemClick = (source, index) => () => {
    const data = index !== undefined ? source.children[index] : source;
    const key = source.dataIndex || source.key;

    let tmp = `<div class="${ss.tagTag}"><div class="${ss.assist}"></div>`;
    tmp += `<div contenteditable="false" data-id="${key}" class="${ss.tag}">${data.title}</div>`;
    tmp += `<div class="${ss.assist}"></div></div>`;

    getCursorPlace(tmp);
    getResultResult();
  };

  // editorcontent输入
  const handleChange = () => {
    getResultResult();
  };

  // 点击完成按钮
  const handleOk = () => {
    onOk(innValue);
  };

  const tagAry = JSON.parse(JSON.stringify(columnsWithHide))
    .map((v) => {
      if (v.children && v.children.length) {
        const res = v.children
          .map((vv) => {
            return vv.valueType === 'number' ? vv : undefined;
          })
          .filter((v) => v);
        if (res.length) {
          v.children = res;
          return v;
        } else {
          return undefined;
        }
      } else if (v.valueType === 'number') {
        return v;
      } else {
        return undefined;
      }
    })
    .filter((v) => v);

  const yEditorRef = (e) => {
    if (isFirstSet && e) {
      setisFirstSet(false);
      set(value, true, e);
      setTimeout(() => {
        e.focus();
      }, 0);
    }
  };

  return (
    <div className={ss.yEditor}>
      {/* 顶部输入框 */}
      <div className={ss.inputBox}>
        <div
          className={ss.editorBoxDiy}
          contentEditable={true}
          suppressContentEditableWarning="true"
          onInput={handleChange}
          id="yEditorId"
          ref={yEditorRef}
        />
        <Button type="primary" size="small" onClick={handleOk}>
          完成
        </Button>
      </div>
      {/* 底部tag标签 */}
      <div className={ss.tagBox}>
        {!!tagAry.length && (
          <div className={ss.left}>
            <div className={ss.leftTitle}>字段</div>
            {tagAry.map((v, i) =>
              v.children ? (
                v.children.map((vv, ii) => (
                  <div
                    key={ii + i}
                    className={ss.tag}
                    title={vv.title}
                    onClick={tagItemClick(v, ii)}
                  >
                    {vv.title}
                  </div>
                ))
              ) : (
                <div key={i} className={ss.tag} title={v.title} onClick={tagItemClick(v)}>
                  {v.title}
                </div>
              ),
            )}
          </div>
        )}

        <div className={ss.right}>
          <div className={ss.rightCont}>支持手动输入公式计算识别</div>
          <div className={ss.rightTitle}>例子</div>
          <div className={ss.rightDemo}>3 + 5</div>
          <div className={ss.rightDemo}>10 / 5</div>
          <div className={ss.rightDemo}>2 * 20</div>
        </div>
      </div>
    </div>
  );
};

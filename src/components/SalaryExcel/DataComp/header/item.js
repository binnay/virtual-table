import React from 'react';
import classnames from 'classnames';
import { Resizable } from 'react-resizable';
import { minItemWidth } from '../../utils/config';
import { changeTableColumns } from '../../utils/tools';
import ss from './item.less';
import MenuDown from './menuDown';
let touchStartLeft = -1;

export default (props) => {
  const {
    index,
    style,
    mainColumns,
    data,
    dataSource,
    change,
    changeTable,
    moveLine,
    excelBox,
    type,
    resize,
    isMerge,
  } = props;
  const { children: subColumns, dataIndex, key } = mainColumns;
  const isFixCol = ['right', 'left'].includes(type); //是否固定列
  const fatherNotResize = isFixCol || resize === false; //是否可拖拽, 固定列和明确表示不能缩放的列
  const isNotShowSub = !subColumns || !subColumns.length; //短路，当children不存在的时候，不会执行后半部分，不用判断children是否是数组
  const fatherKey = dataIndex || key; //父元素的key

  // =============================================== 父项和子项 ===============================================
  const renderMain = () => {
    //  父项-第一行
    const item = () => {
      return (
        <div
          title={mainColumns.title}
          className={classnames(ss.faterBox, {
            [ss.rowSpan]: isMerge && isNotShowSub,
          })}
        >
          {mainColumns.title}
        </div>
      );
    };
    return (
      <MenuDown
        isFixCol={isFixCol}
        name={mainColumns.title}
        change={change}
        data={data}
        changeIndex="main"
        index={index}
        currentData={mainColumns}
        dataSource={dataSource}
        changeTable={changeTable}
      >
        {isNotShowSub && !fatherNotResize ? renderResize(item(), fatherKey, 'main') : item()}
      </MenuDown>
    );
  };

  const renderSub = () => {
    // 子项-第二行
    const item = (width, title, key) => (
      <div className={classnames(ss.children)} style={{ width }} key={key} title={title}>
        {title}
      </div>
    );
    return (
      <div className={ss.childrenBox}>
        {subColumns.map((v, i) => {
          const { title, width, dataIndex, key, resize } = v;
          const childrenKey = dataIndex || key;
          const childrenNotReisze = fatherNotResize || resize === false; //父级不能缩放则子级也不能缩放 或者 父级可以缩放那么子级可以自定义
          return (
            <MenuDown
              key={childrenKey}
              isFixCol={isFixCol}
              name={title}
              change={change}
              data={data}
              changeIndex={i}
              index={index}
              currentData={v}
              dataSource={dataSource}
              changeTable={changeTable}
            >
              {childrenNotReisze
                ? item(width, title, childrenKey)
                : renderResize(item(width, title), childrenKey, i)}
            </MenuDown>
          );
        })}
      </div>
    );
  };

  // =============================================== 父子组合-二行-最终渲染 ===============================================
  const concatMainSub = () => {
    return (
      <div className={ss.columnsItem}>
        {renderMain()}
        {!isNotShowSub && renderSub()}
      </div>
    );
  };

  // =============================================== 可拖拽item ===============================================
  const renderResize = (children, id, type) => (
    <Resizable
      key={id}
      width={style.width + 1}
      height={0} //设置一个0，高度不重要，高度不会变, 未来需求可能需要变化
      onResize={handleResize(type)}
      onResizeStart={handleResizeStart(type)}
      onResizeStop={handleResizeStop(type)}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      {children}
    </Resizable>
  );

  const handleResize = (changeIndex) => (e) => {
    if (moveLine.current) {
      const sourceWidth =
        changeIndex === 'main' ? mainColumns.width : subColumns[changeIndex].width;
      if (e.pageX - touchStartLeft + sourceWidth >= minItemWidth) {
        moveLine.current.style.left = e.pageX + 'px';
      }
    }
  };

  const handleResizeStart = () => (e) => {
    touchStartLeft = e.pageX;
    moveLine.current.style.display = 'block';
    if (excelBox.current) {
      excelBox.current.style.userSelect = 'none';
    }
  };

  const handleResizeStop = (changeIndex) => (e) => {
    const sourceWidth = changeIndex === 'main' ? mainColumns.width : subColumns[changeIndex].width;
    const widthPre = Math.ceil(e.pageX - touchStartLeft + sourceWidth + 1);
    const width = widthPre < minItemWidth ? minItemWidth : widthPre;
    const { result } = changeTableColumns({
      data,
      index,
      changeIndex,
      type: 'width',
      value: width,
    });
    change(result, index);

    touchStartLeft = -1;
    if (moveLine.current) {
      moveLine.current.style.display = 'none';
    }
    if (excelBox.current) {
      excelBox.current.style.userSelect = 'text';
    }
  };

  // =============================================== render ===============================================
  return <div style={style}>{concatMainSub()}</div>;
};

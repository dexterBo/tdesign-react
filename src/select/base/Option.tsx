import React, { useEffect } from 'react';
import classNames from 'classnames';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import get from 'lodash/get';

import useConfig from '../../hooks/useConfig';
import useDomRefCallback from '../../hooks/useDomRefCallback';
import useRipple from '../../hooks/useRipple';
import { StyledProps } from '../../common';
import { SelectValue, TdOptionProps, TdSelectProps, SelectKeysType, SelectOption } from '../type';

/**
 * Option 组件属性
 */
export interface SelectOptionProps
  extends StyledProps,
    TdOptionProps,
    Pick<TdSelectProps, 'size' | 'multiple' | 'max'> {
  selectedValue?: SelectValue;
  children?: React.ReactNode;
  onSelect?: (
    value: string | number,
    context: {
      label?: string;
      selected?: boolean;
      event: React.MouseEvent<HTMLLIElement>;
      restData?: Record<string, any>;
    },
  ) => void;
  onCheckAllChange?: (checkAll: boolean, e: React.MouseEvent<HTMLLIElement>) => void;
  restData?: Record<string, any>;
  keys?: SelectKeysType;
  optionLength?: number;
  isVirtual?: boolean;
  onRowMounted?: (rowData: { ref: HTMLElement; data: SelectOption }) => void;
}

const componentType = 'select';

const Option: React.FC<SelectOptionProps> = (props) => {
  const {
    disabled: propDisabled,
    label: propLabel,
    title: propTitle,
    selectedValue,
    checkAll,
    multiple,
    size,
    max,
    keys,
    value,
    onSelect,
    children,
    content,
    restData,
    style,
    className,
    isVirtual,
  } = props;

  let selected: boolean;
  let indeterminate: boolean;
  const label = propLabel || value;
  const disabled = propDisabled || (multiple && Array.isArray(selectedValue) && max && selectedValue.length >= max);

  const { classPrefix } = useConfig();

  // 使用斜八角动画
  const [optionRef, setRefCurrent] = useDomRefCallback();

  useEffect(() => {
    if (isVirtual && optionRef) {
      props.onRowMounted?.({
        ref: optionRef,
        data: props,
      });
    }
    // eslint-disable-next-line
  }, [isVirtual, optionRef]);

  useRipple(optionRef);

  // 处理单选场景
  if (!multiple) {
    selected =
      isNumber(selectedValue) || isString(selectedValue)
        ? value === selectedValue
        : value === get(selectedValue, keys?.value || 'value');
  }
  // 处理多选场景
  if (multiple && Array.isArray(selectedValue)) {
    selected = selectedValue.some((item) => {
      if (isNumber(item) || isString(item)) {
        // 如果非 object 类型
        return item === value;
      }
      return get(item, keys?.value || 'value') === value;
    });
    if (props.checkAll) {
      selected = selectedValue.length === props.optionLength;
      indeterminate = selectedValue.length > 0 && !selected;
    }
  }

  const handleSelect = (event: React.MouseEvent<HTMLLIElement>) => {
    if (!disabled && !checkAll) {
      onSelect(value, { label: String(label), selected, event, restData });
    }
    if (checkAll) {
      props.onCheckAllChange?.(selected, event);
    }
  };

  const renderItem = (children: React.ReactNode) => {
    if (multiple) {
      return (
        <label
          className={classNames(`${classPrefix}-checkbox`, {
            [`${classPrefix}-is-indeterminate`]: indeterminate,
            [`${classPrefix}-is-disabled`]: disabled,
            [`${classPrefix}-is-checked`]: selected,
          })}
          title={propTitle || (label as string)}
        >
          <input
            type="checkbox"
            className={classNames(`${classPrefix}-checkbox__former`)}
            value=""
            disabled={disabled && !selected}
            onClick={(e) => {
              e.stopPropagation();
              e.nativeEvent.stopImmediatePropagation();
            }}
          />
          <span className={classNames(`${classPrefix}-checkbox__input`)}></span>
          <span className={classNames(`${classPrefix}-checkbox__label`)}>{children || content || label}</span>
        </label>
      );
    }
    return <span title={propTitle || (label as string)}>{children || content || label}</span>;
  };

  return (
    <li
      className={classNames(className, `${classPrefix}-${componentType}-option`, {
        [`${classPrefix}-is-disabled`]: disabled,
        [`${classPrefix}-is-selected`]: selected,
        [`${classPrefix}-size-s`]: size === 'small',
        [`${classPrefix}-size-l`]: size === 'large',
      })}
      key={value}
      onClick={handleSelect}
      ref={setRefCurrent}
      style={style}
    >
      {renderItem(children)}
    </li>
  );
};

export default Option;

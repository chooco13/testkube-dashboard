import {ReactElement} from 'react';

import {Input, Radio, Select} from 'antd';
import {Rule} from 'antd/lib/form';

import {UploadWithInput} from '@atoms';

import {FormItem} from '@custom-antd';

import {LabelsSelect} from '@molecules';
import VariablesFormList from '@molecules/VariablesFormList';

import {k8sResourceNameRegex} from '@utils/strings';

import Fonts from '@styles/Fonts';

const {TextArea} = Input;

export const required: Rule = {required: true, message: 'Required.'};
export const digits: Rule = {pattern: /\d/, message: 'Only digits.'};
export const requiredNoText: Rule = {required: true, message: ''};
export const k8sResourceNamePattern: Rule = {pattern: k8sResourceNameRegex, message: 'Wrong k8s name pattern'};
export const k8sResourceNameMaxLength: Rule = {max: 63, message: 'Max length 63 symbols'};
export const url: Rule = {type: 'url'};
export const duplicateKeyMessage = 'Duplicate key.';

type DefaultConfig = {
  onFileChange?: () => {};
  onLabelsChange?: (value: any) => void;
  form?: null;
};

export const renderFormItems = (array: any, config: DefaultConfig = {}) => {
  const {onFileChange, onLabelsChange, form} = config;

  return array.map((formItem: any) => {
    const {
      options = null,
      itemLabel,
      tooltip,
      fieldName,
      inputType,
      modificator = null,
      rules = [],
      help = null,
      placeholder = null,
      required: isItemRequired,
    } = formItem;

    let children: Nullable<ReactElement<any, any>> = null;

    if (inputType === 'select') {
      children = <Select placeholder={placeholder} showSearch options={options} />;
    }

    if (inputType === 'radio') {
      children = (
        <Radio.Group>
          {options.map((option: any) => {
            return (
              <Radio value={option.value} key={option.value}>
                {option.label}
              </Radio>
            );
          })}
        </Radio.Group>
      );
    }

    if (inputType === 'labels') {
      children = (
        <div style={{width: '100%'}}>
          <LabelsSelect onChange={onLabelsChange!} />
        </div>
      );
    }

    if (inputType === 'default') {
      if (modificator) {
        if (modificator === 'password') {
          children = <Input.Password placeholder={placeholder} />;
        }
      } else {
        children = <Input placeholder={placeholder} />;
      }
    }

    if (inputType === 'uploadWithInput' && onFileChange) {
      children = <UploadWithInput onFileChange={onFileChange} />;
    }

    if (inputType === 'textarea') {
      children = <TextArea rows={10} placeholder={placeholder} style={{fontFamily: Fonts.robotoMono}} />;
    }

    if (inputType === 'variables' && form) {
      return <VariablesFormList form={form} data={[]} isSaveable={false} />;
    }

    if (!children) {
      return null;
    }

    return (
      <FormItem
        rules={rules}
        label={itemLabel}
        name={fieldName}
        tooltip={tooltip}
        key={fieldName}
        help={help}
        required={isItemRequired}
        requiredMark={isItemRequired ? undefined : 'optional'}
      >
        {children}
      </FormItem>
    );
  });
};

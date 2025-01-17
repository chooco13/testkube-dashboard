import {useContext} from 'react';

import {Form} from 'antd';

import {useAppSelector} from '@redux/hooks';
import {selectCurrentSource, setCurrentSource} from '@redux/reducers/sourcesSlice';

import {Input} from '@custom-antd';

import {ConfigurationCard, notificationCall} from '@molecules';

import {required} from '@utils/form';
import {displayDefaultErrorNotification, displayDefaultNotificationFlow} from '@utils/notification';

import {useUpdateSourceMutation} from '@services/sources';

import {MainContext} from '@contexts';

const NameNUrl: React.FC = () => {
  const source = useAppSelector(selectCurrentSource);
  const {dispatch} = useContext(MainContext);

  const [updateSource] = useUpdateSourceMutation();

  const name = source?.name;
  const uri = source?.repository?.uri;

  const [form] = Form.useForm();

  const onFinish = (values: {name: string; uri: string}) => {
    if (!source) {
      notificationCall('failed', 'Something went wrong.');
      return;
    }

    const body = {
      ...source,
      name: values.name,
      repository: {
        ...source.repository,
        uri: values.uri,
      },
    };

    updateSource(body)
      .then(res => {
        displayDefaultNotificationFlow(res, () => {
          notificationCall('passed', 'Source was succesfully updated.');
          dispatch(setCurrentSource(body));
        });
      })
      .catch(err => {
        displayDefaultErrorNotification(err);
      });
  };

  return (
    <Form
      form={form}
      name="general-settings-name-url"
      initialValues={{name, uri}}
      layout="vertical"
      onFinish={onFinish}
    >
      <ConfigurationCard
        title="Source name & repository URL"
        description="Define the name and type of the executor which will be displayed across the Dashboard and CLI"
        onConfirm={() => {
          form.submit();
        }}
        onCancel={() => {
          form.resetFields();
        }}
      >
        <Form.Item label="Name" required name="name" rules={[required]}>
          <Input placeholder="e.g.: my-git-test-repository" disabled />
        </Form.Item>
        <Form.Item label="Git repository URL" required name="uri" rules={[required]}>
          <Input placeholder="e.g.: https://github.com/myCompany/myRepo.git" />
        </Form.Item>
      </ConfigurationCard>
    </Form>
  );
};

export default NameNUrl;

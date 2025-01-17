import {useContext, useEffect, useMemo, useState} from 'react';

import {useAppSelector} from '@redux/hooks';
import {selectSources, setSources} from '@redux/reducers/sourcesSlice';

import {Button, Modal, Skeleton, Text} from '@custom-antd';

import {PageBlueprint} from '@organisms';

import {useGetSourcesQuery} from '@services/sources';

import Colors from '@styles/Colors';

import {MainContext} from '@contexts';

import AddSourceModal from './AddSourceModal';
import EmptySources from './EmptySources';
import {SourceContainer, SourcesGrid, SourcesListSkeletonWrapper} from './SourcesList.styled';

const Sources: React.FC = () => {
  const sourcesList = useAppSelector(selectSources);

  const {data: sources, refetch, isLoading} = useGetSourcesQuery(null);

  const {dispatch, navigate, location} = useContext(MainContext);
  const [isAddSourceModalVisible, setAddSourceModalVisibility] = useState(false);

  const onNavigateToDetails = (name: string) => {
    navigate(`sources/${name}`);
  };

  useEffect(() => {
    if (sources) {
      dispatch(setSources(sources));
    }
  }, [sources]);

  useEffect(() => {
    refetch();
  }, [location]);

  const renderedSourcesGrid = useMemo(() => {
    return sourcesList.map(sourceItem => {
      return (
        <SourceContainer onClick={() => onNavigateToDetails(sourceItem.name)} key={sourceItem.name}>
          <Text className="regular big">{sourceItem.name}</Text>
          <Text className="regular small" color={Colors.slate500}>
            {sourceItem.repository?.uri}
          </Text>
        </SourceContainer>
      );
    });
  }, [sourcesList]);

  return (
    <PageBlueprint
      title="Sources"
      description={
        <>
          Define global sources you can refer to in your tests. Learn more about{' '}
          <a href="https://kubeshop.github.io/testkube/openapi/#tag/test-sources" target="_blank">
            Sources
          </a>
        </>
      }
      headerButton={
        <Button $customType="primary" onClick={() => setAddSourceModalVisibility(true)}>
          Create a new source
        </Button>
      }
    >
      {isLoading ? (
        <SourcesListSkeletonWrapper>
          {new Array(6).fill(0).map((_, index) => {
            const key = `skeleton-item-${index}`;

            return <Skeleton additionalStyles={{lineHeight: 80}} key={key} />;
          })}
        </SourcesListSkeletonWrapper>
      ) : renderedSourcesGrid && renderedSourcesGrid.length ? (
        <SourcesGrid>{renderedSourcesGrid}</SourcesGrid>
      ) : (
        <EmptySources
          onButtonClick={() => {
            setAddSourceModalVisibility(true);
          }}
        />
      )}
      {isAddSourceModalVisible ? (
        <Modal
          title="Create a new source"
          isModalVisible={isAddSourceModalVisible}
          setIsModalVisible={setAddSourceModalVisibility}
          width={880}
          content={<AddSourceModal />}
        />
      ) : null}
    </PageBlueprint>
  );
};

export default Sources;

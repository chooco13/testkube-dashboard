import React, {memo, useContext, useEffect, useState} from 'react';
import {Helmet} from 'react-helmet';

import {LoadingOutlined} from '@ant-design/icons';

import {Entity, EntityListBlueprint} from '@models/entity';
import {ModalConfigProps} from '@models/modal';
import {OnDataChangeInterface} from '@models/onDataChange';

import {Button, Modal} from '@custom-antd';

import {EntityGrid} from '@molecules';

import useTrackTimeAnalytics from '@hooks/useTrackTimeAnalytics';

import {compareFiltersObject} from '@utils/objects';

import {MainContext} from '@contexts';

import {TestModalConfig, TestSuiteModalConfig} from '../EntityCreationModal';
import {EntityListContext} from '../EntityListContainer/EntityListContainer';
import Filters from '../EntityListFilters';
import EmptyDataWithFilters from './EmptyDataWithFilters';
import {TestSuitesDataLayer, TestsDataLayer} from './EntityDataLayers';
import {EmptyListWrapper, Header, StyledContainer, StyledFiltersSection} from './EntityListContent.styled';
import EntityListTitle from './EntityListHeader';
import EntityListSkeleton from './EntityListSkeleton';

const modalTypes: {[key in Entity]: ModalConfigProps} = {
  'test-suites': TestSuiteModalConfig,
  tests: TestModalConfig,
};

const EntityListContent: React.FC<EntityListBlueprint> = props => {
  const {
    pageTitle,
    pageDescription: PageDescription,
    emptyDataComponent: EmptyData,
    entity,
    filtersComponentsIds,
    setData,
    initialFiltersState,
    addEntityButtonText,
    dataTestID,
  } = props;

  const [isFirstTimeLoading, setFirstTimeLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);

  const {dispatch, navigate, apiEndpoint} = useContext(MainContext);
  const {queryFilters, dataSource, setQueryFilters} = useContext(EntityListContext);

  const [contentProps, setContentProps] = useState<OnDataChangeInterface>({
    data: [],
    isLoading: false,
    isFetching: false,
    refetch: () => {},
  });

  const onDataChange = (args: OnDataChangeInterface) => {
    setContentProps(args);
  };

  const dataLayers: {[key in Entity]: any} = {
    tests: <TestsDataLayer onDataChange={onDataChange} queryFilters={queryFilters} />,
    'test-suites': <TestSuitesDataLayer onDataChange={onDataChange} queryFilters={queryFilters} />,
  };

  const resetFilters = () => {
    dispatch(setQueryFilters(initialFiltersState));
  };

  const onNavigateToDetails = (item: any) => {
    navigate(`${entity}/executions/${item.dataItem.name}`);
  };

  useEffect(() => {
    if (!setData || contentProps.isLoading || contentProps.isFetching) {
      return;
    }

    if (contentProps.data && contentProps.data.length) {
      setFirstTimeLoading(false);
      dispatch(setData(contentProps.data));

      return;
    }

    if (!contentProps.data || !contentProps.data.length) {
      setFirstTimeLoading(false);
      // if no results - set result as an empty array because not all the time we get an empty array from backend
      dispatch(setData([]));
    }
  }, [contentProps.data, contentProps.isLoading, contentProps.isFetching]);

  useEffect(() => {
    setFirstTimeLoading(true);

    return () => {
      setFirstTimeLoading(true);
    };
  }, [entity, apiEndpoint]);

  useEffect(() => {
    setIsApplyingFilters(true);

    try {
      contentProps.refetch().then(() => setIsApplyingFilters(false));
    } catch (err) {
      //
    }
  }, [queryFilters, contentProps.refetch]);

  const isFiltersEmpty = compareFiltersObject(initialFiltersState, queryFilters);
  const isEmptyData = (dataSource?.length === 0 || !dataSource) && isFiltersEmpty && !contentProps.isLoading;

  const addEntityAction = () => {
    setIsModalVisible(true);
  };

  const creationModalConfig: ModalConfigProps = modalTypes[entity];

  useTrackTimeAnalytics(`${entity}-list`);

  return (
    <StyledContainer>
      <Helmet>
        <title>{`${pageTitle} | Testkube`}</title>
        <meta name="description" content={`${PageDescription}`} />
      </Helmet>
      {dataLayers[entity]}
      <Header>
        <EntityListTitle
          pageTitle={
            <>
              {pageTitle} {isApplyingFilters ? <LoadingOutlined /> : null}
            </>
          }
        >
          <PageDescription />
        </EntityListTitle>
        {filtersComponentsIds && filtersComponentsIds.length ? (
          <StyledFiltersSection>
            <Filters
              setFilters={setQueryFilters}
              filters={queryFilters}
              filtersComponentsIds={filtersComponentsIds}
              entity={entity}
              isFiltersDisabled={isEmptyData}
            />
            <Button $customType="primary" onClick={addEntityAction} data-test={dataTestID}>
              {addEntityButtonText}
            </Button>
          </StyledFiltersSection>
        ) : null}
      </Header>
      {isFirstTimeLoading ? (
        <EntityListSkeleton />
      ) : !dataSource || !dataSource.length ? (
        <EmptyListWrapper>
          {isFiltersEmpty ? (
            <EmptyData action={addEntityAction} />
          ) : (
            <EmptyDataWithFilters resetFilters={resetFilters} />
          )}
        </EmptyListWrapper>
      ) : (
        <EntityGrid data={dataSource} onNavigateToDetails={onNavigateToDetails} />
      )}
      {isModalVisible ? (
        <Modal {...creationModalConfig} setIsModalVisible={setIsModalVisible} isModalVisible={isModalVisible} />
      ) : null}
    </StyledContainer>
  );
};

export default memo(EntityListContent);

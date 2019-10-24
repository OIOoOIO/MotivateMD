import { Spin, Icon } from 'antd';

const antIcon = <Icon type="loading" style={{ fontSize: 16 }} spin />;

const Loader = (props) => {
  return(
    <Spin indicator={antIcon} />
  );
}

export default Loader;
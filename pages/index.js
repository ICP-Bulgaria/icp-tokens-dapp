import Layout from '../ui/components/_base/Layout';
import Link from 'next/link';
import TokensTable from '../ui/components/TokensTable';

const Home = () => {
  return (
    <Layout>
      <div>
        <h1 className=' text-xl font-semibold'>Internet Computer Tokens by Market Cap</h1>
        <TokensTable />
      </div>
    </Layout>
  );
};

export default Home;

import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import PageTitle from '@/components/PageTitle';
import { useState, SyntheticEvent } from 'react';
import defaultCfg from '@/common/kite/constants';
import PageTitleWrapper from '@/components/PageTitleWrapper';
import {
  Container,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Button
} from '@mui/material';
import Footer from 'src/components/Footer';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import ExportConfigBtn from '@/content/Dashboards/Tasks/ExportConfigBtn';
import ShutDownBtn from '@/content/Dashboards/Tasks/ShutdownBtn';



function Forms() {
  const [portsOpen, setPortsOpen] = useState<PortsOpen>({});
  const [kiteConfigRequest, setKiteConfigRequest] = useState(defaultCfg);



  return (
    <>
      <Head>
        <title>Connect an Existing Kafka Configuration</title>
      </Head>
      <PageTitleWrapper>
        <PageTitle
          heading="Connect an Existing Kafka Configuration"
          subHeading="Connect an existing Kafka instance to view health metrics, configure topics and partition settings, and more."
          docs="https://kafka.apache.org/"
        />
      </PageTitleWrapper>
     
          <Grid textAlign='center' item xs={12}>

          </Grid>
    
    </>
  );
}

Forms.getLayout = (page) => <SidebarLayout>{page}</SidebarLayout>;

export default Forms;

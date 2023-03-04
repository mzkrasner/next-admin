import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import PageTitle from '@/components/PageTitle';
import { useState, SyntheticEvent } from 'react';
import defaultCfg from '@/common/kite/constants';
import PageTitleWrapper from '@/components/PageTitleWrapper';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Container,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Button,
  AccordionDetails,
  Accordion,
  AccordionSummary,
  Typography,
} from '@mui/material';
import Footer from 'src/components/Footer';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import ExportConfigBtn from '@/content/Dashboards/Tasks/ExportConfigBtn';
import ShutDownBtn from '@/content/Dashboards/Tasks/ShutdownBtn';



export interface PortsOpen {
  [index: string]: PortOpen;
}

export interface PortOpen {
  [type: string]: boolean;
}

export interface CheckPortOpen {
  (index: string, type: string, port: number): Promise<boolean>;
}

const dataSources = [
  {
    value: 'postgresql',
    label: 'PostgreSQL'
  },
  {
    value: 'KSQL',
    label: 'KSQL'
  },
];

const dataSinks = [
  {
    value: 'jupyter',
    label: 'Jupyter'
  },
  {
    value: 'Spark',
    label: 'Spark'
  },
];

const DEFAULT_BROKER_ID = 101;
const DEFAULT_JMX_PORT = 9991;
const DEFAULT_BROKER_PORT = 9091;

function Forms() {
  const [portsOpen, setPortsOpen] = useState<PortsOpen>({});
  const [kiteConfigRequest, setKiteConfigRequest] = useState(defaultCfg);
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  function updateKiteConfigRequest(update: Partial<KiteConfig>): void {
    setKiteConfigRequest((kiteConfigRequest) => {
      return {
        ...kiteConfigRequest,
        ...update,
      };
    });
  }

  const checkPortOpen: CheckPortOpen = async (index, type, port) => {
    console.log({ index, type, port });
    const isOpen = await isPortOpen(port);
    setPortsOpen((portsOpen) => ({
      ...portsOpen,
      [index]: {
        ...portsOpen[index],
        [type]: isOpen,
      },
    }));
    console.log(isOpen);

    return isOpen;
  };

  async function isPortOpen(port: number): Promise<boolean> {
    const { isOpen } = await fetch('/api/checkPort', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ port }),
    })
      .then((response) => response.json())
      .catch((error) => {
        console.error(error.message);
      });

    return isOpen;
  }

  function submitHandler(event: SyntheticEvent) {
    event.preventDefault();

    // TODO: Prevent state for deleted brokers from being submitted
    //console.log(kiteConfigRequest)
    console.log('sending configuration…');
    //console.log(defaultCfg);
    fetch('/api/kite/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(kiteConfigRequest),
    })
      .then((response) => {
        console.dir(response);

        setTimeout(() => {
          // redirect to display page
          window.location.href = '/display';
        }, 10000);
        // setKiteConfigRequest(defaultConfig);
      })
      .catch((error) => {
        console.error(error.message);
      });
    // setSubmit(false);
  }


  const handleData = (event) => {
    updateKiteConfigRequest({
      db: {
        name: event.target.value,
      },
    });
  };

  const handleBrokers = (event) => {
    const size = event.target.value;
    if (size <= 0) return;
    const update = {
      kafka: {
        ...kiteConfigRequest.kafka,
        brokers: {
          ...kiteConfigRequest.kafka.brokers,
          size,
        },
      },
    };
    updateKiteConfigRequest(update);
  };

  const handleZoo = (event) => {
    const size = event.target.value;
    if (size <= 0) return;
    const update = {
      kafka: {
        ...kiteConfigRequest.kafka,
        zookeepers: {
          ...kiteConfigRequest.kafka.zookeepers,
          size,
        },
      },
    };
    updateKiteConfigRequest(update);
  };

  const handleSink = (event) => {
    updateKiteConfigRequest({
      sink: {
        name: event.target.value,
      },
    });
  };

  const renderAdvanced = () => {
    const res: JSX.Element[] = [];
    for(let i = 0; i < kiteConfigRequest.kafka.brokers.size; i++){
      res.push(
      <>
        <p>Broker {i + 1}</p>
        <TextField
          id="filled-number"
          label="ID"
          type="number"
          placeholder={(DEFAULT_BROKER_ID + i).toString()}
          value={kiteConfigRequest.kafka.brokers?.id?.[i] || ''}
          InputLabelProps={{
            shrink: true
          }}
          variant="filled"
          onChange={(e) => {
            if (+e.target.value <= 0) return;
            const id: number[] = kiteConfigRequest.kafka.brokers.id ?? [];
            id[i] = +e.target.value;

            const update = {
              kafka: {
                ...kiteConfigRequest.kafka,
                brokers: {
                  ...kiteConfigRequest.kafka.brokers,
                  id,
                },
              },
            };
            updateKiteConfigRequest(update);
          }}
        />
        <TextField
          id="filled-number"
         
          placeholder={(DEFAULT_BROKER_PORT + i).toString()}
          onChange={(e) => {
            if (+e.target.value <= 0) return;
            
            const brokers: number[] =
              kiteConfigRequest.kafka.brokers.ports?.brokers ?? [];
            brokers[i] = +e.target.value;

            const update = {
              kafka: {
                ...kiteConfigRequest.kafka,
                brokers: {
                  ...kiteConfigRequest.kafka.brokers,
                  ports: {
                    ...kiteConfigRequest.kafka.brokers.ports,
                    brokers,
                  },
                },
              },
            };
            updateKiteConfigRequest(update);
          }}
          value={
            kiteConfigRequest.kafka.brokers?.ports?.brokers?.[i] || ''
          }
          label="Port"
          type="number"
          InputLabelProps={{
            shrink: true
          }}
          
          error={

              portsOpen[`broker-${i}`['port']]

          }
          
          onBlur={(e) =>
            checkPortOpen(
              `broker-${i}`,
              'port',
              Number(e.target.value)
            )}
          variant="filled"
        />
        <TextField
          id="filled-number"
          placeholder={(DEFAULT_JMX_PORT + i).toString()}
          onChange={(e) => {
            if (+e.target.value <= 0) return;
            const jmx: number[] =
              kiteConfigRequest.kafka.brokers?.ports?.jmx ?? [];
            jmx[i] = +e.target.value;

            const update = {
              kafka: {
                ...kiteConfigRequest.kafka,
                brokers: {
                  ...kiteConfigRequest.kafka.brokers,
                  ports: {
                    ...kiteConfigRequest.kafka.brokers.ports,
                    jmx,
                  },
                },
              },
            };
            updateKiteConfigRequest(update);
          }}
          value={
            kiteConfigRequest.kafka.brokers?.ports?.jmx?.[i] || ''
          }
          label="JMX Port"
          type="number"
          InputLabelProps={{
            shrink: true
          }}
          variant="filled"
        />
      </>)
    }
    return res;
  }

  return (
    <>
      <Head>
        <title>Configure Your Kafka Cluster</title>
      </Head>
      <PageTitleWrapper>
        <PageTitle
          heading="Configure Your Kafka Cluster"
          subHeading="Select your preferred number of brokers, zookeepers, data source, data sink, or configure advanced settings."
          docs="https://kafka.apache.org/"
        />
      </PageTitleWrapper>
      <Container maxWidth="lg">
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="stretch"
          spacing={3}
        >
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Required Settings" />
              <Divider />
              <CardContent>
                <Box
                  component="form"
                  sx={{
                    '& .MuiTextField-root': { m: 2, width: '30ch' }
                  }}
                  noValidate
                  autoComplete="off"
                >
                  <div>
                    <TextField
                      id="outlined-number"
                      label="Brokers"
                      type="number"
                      defaultValue="2"
                      onChange={handleBrokers}
                      value={kiteConfigRequest.kafka.brokers.size}
                      InputLabelProps={{
                        shrink: true
                      }}
                    />
                    <TextField
                      id="outlined-number"
                      defaultValue="2"
                      label="Zookeepers"
                      type="number"
                      onChange={handleZoo}
                      value={kiteConfigRequest.kafka.zookeepers.size}
                      InputLabelProps={{
                        shrink: true
                      }}
                    />
                    <TextField
                      id="outlined-select-source-native"
                      select
                      label="Data Source"
                      value={kiteConfigRequest.db?.name}
                      onChange={handleData}
                      helperText="Please select your data source"
                    >
                     {dataSources.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      id="outlined-select-sink-native"
                      select
                      label="Data Sink"
                      value={kiteConfigRequest.sink?.name}
                      onChange={handleSink}
                      helperText="Please select your data sink"
                    >
                     {dataSinks.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>

                  </div>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
          <Accordion expanded={expanded === 'panel4'} onChange={handleChange('panel4')}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel4bh-content"
          id="panel4bh-header"
        >
          <Typography sx={{ width: '33%', flexShrink: 0 }}>Advanced Settings</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Card >
                <Divider />
                <CardContent>
                  <Box
                    component="form"
                    sx={{
                      '& .MuiTextField-root': { m: 1, width: '42ch' }
                    }}
                    noValidate
                    autoComplete="off"
                  >
                    {renderAdvanced()}
                  </Box>
                </CardContent>
              </Card>
        </AccordionDetails>
      </Accordion>
          </Grid>
          <Grid textAlign='center' item xs={12}>
            <Button sx={{ margin: 2 }} variant="contained" onClick={submitHandler}>
              Submit
            </Button>
            <Card>
              <Box textAlign='center'>
                <ExportConfigBtn />
                <ShutDownBtn />
                </Box>
           
            </Card>
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </>
  );
}

Forms.getLayout = (page) => <SidebarLayout>{page}</SidebarLayout>;

export default Forms;

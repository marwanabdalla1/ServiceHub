import React, { useState } from 'react';
import Drawer from '@mui/joy/Drawer';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import ModalClose from '@mui/joy/ModalClose';
import Divider from '@mui/joy/Divider';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import FormHelperText from '@mui/joy/FormHelperText';
import Stack from '@mui/joy/Stack';
import RadioGroup from '@mui/joy/RadioGroup';
import Radio from '@mui/joy/Radio';
import Sheet from '@mui/joy/Sheet';
import Switch from '@mui/joy/Switch';
import Typography from '@mui/joy/Typography';
import Slider from '@mui/material/Slider';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ChildFriendlyIcon from '@mui/icons-material/ChildFriendly';
import SchoolIcon from '@mui/icons-material/School';
import PetsIcon from '@mui/icons-material/Pets';
import SpaIcon from '@mui/icons-material/Spa';
import BuildIcon from '@mui/icons-material/Build';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import Box from '@mui/material/Box';
import {GERMAN_CITIES_SUPPORT} from "../shared/Constants";

interface DrawerFilterProps {
  openDrawer: boolean;
  toggleDrawer: () => void;
  filterState: {
    type: string;
    priceRange: number[];
    locations: string[];
    isLicensed?: boolean;
  };
  onApplyFilters: (filterState: {
    type: string;
    priceRange: number[];
    locations: string[];
    isLicensed?: boolean;
  }) => void;
  onClearFilters: () => void;
}

export const DrawerFilter: React.FC<DrawerFilterProps> = ({
  toggleDrawer, openDrawer, filterState, onApplyFilters, onClearFilters
}) => {
  const [localFilterState, setLocalFilterState] = useState(filterState);

  const handlePriceChange = (event: Event, newValue: number | number[]) => {
    setLocalFilterState(prevState => ({
      ...prevState,
      priceRange: newValue as number[]
    }));
  };

  const handleLocationChange = (event: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = event;
    setLocalFilterState(prevState => ({
      ...prevState,
      locations: typeof value === 'string' ? value.split(',') : value
    }));
  };

  const handleTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalFilterState(prevState => ({
      ...prevState,
      type: event.target.value
    }));
  };

  const handleLicensedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalFilterState(prevState => ({
      ...prevState,
      isLicensed: event.target.checked ? true : undefined
    }));
  };

  const handleApplyFilters = () => {
    onApplyFilters(localFilterState);
    toggleDrawer();
  };

  return (
    <Drawer
      size="md"
      variant="plain"
      open={openDrawer}
      onClose={toggleDrawer}
      slotProps={{
        content: {
          sx: {
            bgcolor: 'transparent',
            p: { md: 3, sm: 0 },
            boxShadow: 'none',
          },
        },
      }}
    >
      <Sheet
        sx={{
          borderRadius: 'md',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          height: '100%',
          overflow: 'auto',
        }}
      >
        <DialogTitle>Filters</DialogTitle>
        <ModalClose />
        <Divider sx={{ mt: 'auto' }} />
        <DialogContent sx={{ gap: 2 }}>
          <FormControl>
            <FormLabel sx={{ typography: 'title-md', fontWeight: 'bold' }}>
              Service type
            </FormLabel>
            <RadioGroup
              value={localFilterState.type}
              onChange={handleTypeChange}
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fill, minmax(140px, 1fr))',
                  gap: 1.5,
                }}
              >
                {[
                  {
                    name: 'Bike Repair',
                    icon: <DirectionsBikeIcon />,
                  },
                  {
                    name: 'Moving Services',
                    icon: <LocalShippingIcon />,
                  },
                  {
                    name: 'Babysitting',
                    icon: <ChildFriendlyIcon />,
                  },
                  {
                    name: 'Tutoring',
                    icon: <SchoolIcon />,
                  },
                  {
                    name: 'Petsitting',
                    icon: <PetsIcon />,
                  },
                  {
                    name: 'Landscaping Services',
                    icon: <SpaIcon />,
                  },
                  {
                    name: 'Home Remodeling',
                    icon: <BuildIcon />,
                  },
                  {
                    name: 'House Cleaning',
                    icon: <CleaningServicesIcon />,
                  },
                ].map((item) => (
                  <Card
                    key={item.name}
                    sx={{
                      boxShadow: 'none',
                      '&:hover': { bgcolor: 'background.level1' },
                    }}
                  >
                    <CardContent>
                      {item.icon}
                      <Typography level="title-md">{item.name}</Typography>
                    </CardContent>
                    <Radio
                      disableIcon
                      overlay
                      checked={localFilterState.type === item.name}
                      variant="outlined"
                      color="neutral"
                      value={item.name}
                      sx={{ mt: -2 }}
                      slotProps={{
                        action: {
                          sx: {
                            ...(localFilterState.type === item.name && {
                              borderWidth: 2,
                              borderColor:
                                'var(--joy-palette-primary-outlinedBorder)',
                            }),
                            '&:hover': {
                              bgcolor: 'transparent',
                            },
                          },
                        },
                      }}
                    />
                  </Card>
                ))}
              </Box>
            </RadioGroup>
          </FormControl>

          <Typography level="title-md" fontWeight="bold" sx={{ mt: 2 }}>
            Booking options
          </Typography>
          <FormControl orientation="horizontal">
            <Box sx={{ flex: 1, pr: 1 }}>
              <FormLabel sx={{ typography: 'title-sm' }}>
                Certified Service
              </FormLabel>
              <FormHelperText sx={{ typography: 'body-sm' }}>
                Show service providers with verified credentials.
              </FormHelperText>
            </Box>
            <Switch
              checked={localFilterState.isLicensed ?? false}
              onChange={handleLicensedChange}
            />
          </FormControl>

          <Typography level="title-md" fontWeight="bold" sx={{ mt: 2 }}>
            Price Range
          </Typography>
          <FormControl sx={{ width: '100%', mt: 2 }}>
            <Slider
              sx={{ width: '90%', mx: 'auto' }}
              value={localFilterState.priceRange}
              onChange={handlePriceChange}
              valueLabelDisplay="auto"
              min={10}
              max={100}
              step={1}
              marks={[
                { value: 10, label: '$10' },
                { value: 55, label: '$55' },
                { value: 100, label: '$100' }
              ]}
            />
          </FormControl>

          <Typography level="title-md" fontWeight="bold" sx={{ mt: 2 }}>
            Location
          </Typography>
          <FormControl sx={{ width: '100%', mt: 2 }}>
            <Select
              multiple
              value={localFilterState.locations}
              onChange={handleLocationChange}
              displayEmpty
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.length === 0 ? <em>Select City</em> : null}
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
            >
              <MenuItem disabled value="">
                <em>Select City</em>
              </MenuItem>
              {Object.values(GERMAN_CITIES_SUPPORT).map((city) => (
                <MenuItem key={city} value={city}>
                  {city}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>

        <Divider sx={{ mt: 'auto' }} />
        <Stack
          direction="row"
          justifyContent="space-between"
          useFlexGap
          spacing={1}
        >
          <Button
            variant="outlined"
            color="neutral"
            onClick={() => {
              setLocalFilterState({
                type: '',
                priceRange: [15, 9999],
                locations: [],
                isLicensed: undefined,
              });
              onClearFilters();
            }}
          >
            Clear
          </Button>
          <Button onClick={handleApplyFilters}>Apply</Button>
        </Stack>
      </Sheet>
    </Drawer>
  );
};

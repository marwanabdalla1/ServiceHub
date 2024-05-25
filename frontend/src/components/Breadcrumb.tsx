import React from 'react';
import { Breadcrumbs, Link, Typography } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

type BreadcrumbProps = {
    paths: { label: string, href?: string }[];
};

// TODO: change this according to slides
const Breadcrumb: React.FC<BreadcrumbProps> = ({ paths }) => {
    return (
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
            {paths.map((path, index) => (
                path.href ? (
                    <Link key={index} color="inherit" href={path.href}>
                        {path.label}
                    </Link>
                ) : (
                    <Typography key={index} color="textPrimary">
                        {path.label}
                    </Typography>
                )
            ))}
        </Breadcrumbs>
    );
};

export default Breadcrumb;

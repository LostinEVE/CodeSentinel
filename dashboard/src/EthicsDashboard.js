/**
 * Ethics Dashboard - Enterprise-grade Governance and Compliance Interface
 * React-based dashboard for monitoring ethical violations and compliance metrics
 */

import React, { useState } from 'react';
import {
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  LinearProgress,
  Button,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

// Mock data for demonstration
const mockDashboardData = {
  overallScore: 0.73,
  totalFiles: 2847,
  filesScanned: 1923,
  violations: {
    total: 47,
    critical: 8,
    high: 15,
    medium: 18,
    low: 6
  },
  riskBreakdown: {
    surveillance: 0.42,
    discrimination: 0.89,
    privacy: 0.31,
    misuse: 0.56,
    manipulation: 0.28
  },
  trends: [
    { date: '2025-07-27', score: 0.68, violations: 52 },
    { date: '2025-07-28', score: 0.71, violations: 49 },
    { date: '2025-07-29', score: 0.69, violations: 51 },
    { date: '2025-07-30', score: 0.72, violations: 48 },
    { date: '2025-07-31', score: 0.74, violations: 45 },
    { date: '2025-08-01', score: 0.73, violations: 47 },
    { date: '2025-08-02', score: 0.75, violations: 44 }
  ],
  recentViolations: [
    {
      id: 'V001',
      file: 'user-service.js',
      type: 'discrimination',
      severity: 'critical',
      message: 'Nationality-based filtering detected',
      line: 42,
      timestamp: '2025-08-03T10:30:00Z'
    },
    {
      id: 'V002',
      file: 'auth-module.py',
      type: 'misuse',
      severity: 'high',
      message: 'Potential authentication bypass',
      line: 156,
      timestamp: '2025-08-03T09:15:00Z'
    },
    {
      id: 'V003',
      file: 'tracking.js',
      type: 'surveillance',
      severity: 'medium',
      message: 'Location tracking without consent',
      line: 89,
      timestamp: '2025-08-03T08:45:00Z'
    }
  ],
  auditLog: [
    {
      timestamp: '2025-08-03T10:30:00Z',
      action: 'VIOLATION_DETECTED',
      user: 'system',
      file: 'user-service.js',
      details: 'Critical discrimination violation flagged'
    },
    {
      timestamp: '2025-08-03T10:25:00Z',
      action: 'POLICY_UPDATED',
      user: 'admin@company.com',
      file: 'enterprise-policy.yaml',
      details: 'Updated discrimination thresholds'
    },
    {
      timestamp: '2025-08-03T10:20:00Z',
      action: 'SCAN_COMPLETED',
      user: 'system',
      file: 'all',
      details: 'Full repository scan completed - 47 violations found'
    }
  ]
};

const COLORS = {
  critical: '#d32f2f',
  high: '#f57c00',
  medium: '#fbc02d',
  low: '#388e3c',
  primary: '#1976d2'
};

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function EthicsScoreCard({ score, title, description }) {
  const getScoreColor = (score) => {
    if (score >= 0.8) return '#4caf50';
    if (score >= 0.6) return '#ff9800';
    return '#f44336';
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Box display="flex" alignItems="center" mb={2}>
          <Typography variant="h3" color={getScoreColor(score)}>
            {Math.round(score * 100)}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={score * 100}
          sx={{ 
            height: 8, 
            borderRadius: 4,
            backgroundColor: '#e0e0e0',
            '& .MuiLinearProgress-bar': {
              backgroundColor: getScoreColor(score)
            }
          }}
        />
        <Typography variant="body2" color="text.secondary" mt={1}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}

function ViolationSummaryCard({ violations }) {
  const data = [
    { name: 'Critical', value: violations.critical, color: COLORS.critical },
    { name: 'High', value: violations.high, color: COLORS.high },
    { name: 'Medium', value: violations.medium, color: COLORS.medium },
    { name: 'Low', value: violations.low, color: COLORS.low }
  ];

  return (
    <Card>
      <CardHeader title="Violation Breakdown" />
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4">{violations.total}</Typography>
            <Typography variant="body2" color="text.secondary">
              Total Violations
            </Typography>
            <Box mt={2}>
              {data.map((item) => (
                <Chip
                  key={item.name}
                  label={`${item.name}: ${item.value}`}
                  size="small"
                  sx={{ 
                    mr: 1, 
                    mb: 1, 
                    backgroundColor: item.color, 
                    color: 'white' 
                  }}
                />
              ))}
            </Box>
          </Box>
          <ResponsiveContainer width={150} height={150}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={20}
                outerRadius={60}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}

function RiskRadarChart({ riskData }) {
  const data = [
    { risk: 'Surveillance', value: riskData.surveillance },
    { risk: 'Discrimination', value: riskData.discrimination },
    { risk: 'Privacy', value: riskData.privacy },
    { risk: 'Misuse', value: riskData.misuse },
    { risk: 'Manipulation', value: riskData.manipulation }
  ];

  return (
    <Card>
      <CardHeader title="Risk Assessment Radar" />
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="risk" />
            <PolarRadiusAxis domain={[0, 1]} />
            <Radar
              name="Risk Level"
              dataKey="value"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
            />
            <Tooltip formatter={(value) => `${Math.round(value * 100)}%`} />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function TrendsChart({ trends }) {
  return (
    <Card>
      <CardHeader title="Ethics Score Trend" />
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 1]} />
            <Tooltip formatter={(value) => `${Math.round(value * 100)}%`} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="#8884d8" 
              strokeWidth={2}
              name="Ethics Score"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function RecentViolationsTable({ violations }) {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return COLORS.critical;
      case 'high': return COLORS.high;
      case 'medium': return COLORS.medium;
      case 'low': return COLORS.low;
      default: return '#gray';
    }
  };

  return (
    <Card>
      <CardHeader title="Recent Violations" />
      <CardContent>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>File</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Severity</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Line</TableCell>
                <TableCell>Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {violations.map((violation) => (
                <TableRow key={violation.id}>
                  <TableCell>{violation.file}</TableCell>
                  <TableCell>{violation.type}</TableCell>
                  <TableCell>
                    <Chip
                      label={violation.severity}
                      size="small"
                      sx={{
                        backgroundColor: getSeverityColor(violation.severity),
                        color: 'white'
                      }}
                    />
                  </TableCell>
                  <TableCell>{violation.message}</TableCell>
                  <TableCell>{violation.line}</TableCell>
                  <TableCell>
                    {new Date(violation.timestamp).toLocaleTimeString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}

function AuditLogPanel({ auditLog }) {
  return (
    <Card>
      <CardHeader title="Audit Log" />
      <CardContent>
        <List>
          {auditLog.map((entry, index) => (
            <React.Fragment key={index}>
              <ListItem>
                <ListItemText
                  primary={
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body1">{entry.action}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(entry.timestamp).toLocaleString()}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2">
                        User: {entry.user} | File: {entry.file}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {entry.details}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              {index < auditLog.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

function EthicsDashboard() {
  const [tabValue, setTabValue] = useState(0);
  const [data, setData] = useState(mockDashboardData);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const refreshData = () => {
    // In a real implementation, this would fetch from the backend
    console.log('Refreshing dashboard data...');
    // For demo purposes, simulate data refresh
    setData({ ...mockDashboardData });
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Code Ethics Dashboard
        </Typography>
        <Button variant="contained" onClick={refreshData}>
          Refresh Data
        </Button>
      </Box>

      {/* Alert for critical violations */}
      {data.violations.critical > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {data.violations.critical} critical ethical violations detected. Immediate attention required.
        </Alert>
      )}

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Overview" />
        <Tab label="Violations" />
        <Tab label="Trends" />
        <Tab label="Audit Log" />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* Score Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <EthicsScoreCard
              score={data.overallScore}
              title="Overall Ethics Score"
              description="Composite score across all risk categories"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <EthicsScoreCard
              score={1 - data.riskBreakdown.discrimination}
              title="Discrimination Score"
              description="Anti-discrimination compliance"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <EthicsScoreCard
              score={1 - data.riskBreakdown.privacy}
              title="Privacy Score"
              description="Data privacy and protection"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <EthicsScoreCard
              score={data.filesScanned / data.totalFiles}
              title="Coverage"
              description={`${data.filesScanned} / ${data.totalFiles} files scanned`}
            />
          </Grid>

          {/* Violation Summary and Risk Radar */}
          <Grid item xs={12} md={6}>
            <ViolationSummaryCard violations={data.violations} />
          </Grid>
          <Grid item xs={12} md={6}>
            <RiskRadarChart riskData={data.riskBreakdown} />
          </Grid>

          {/* Trends Chart */}
          <Grid item xs={12}>
            <TrendsChart trends={data.trends} />
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <RecentViolationsTable violations={data.recentViolations} />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TrendsChart trends={data.trends} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Violation Trends" />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="violations" fill="#8884d8" name="Violations" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <RiskRadarChart riskData={data.riskBreakdown} />
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <AuditLogPanel auditLog={data.auditLog} />
      </TabPanel>
    </Container>
  );
}

export default EthicsDashboard;

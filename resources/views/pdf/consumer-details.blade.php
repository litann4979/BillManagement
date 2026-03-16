<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Consumer Details - {{ $consumer->scno }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 11px;
            line-height: 1.4;
            color: #333;
        }
        .container {
            padding: 20px;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        .header h1 {
            font-size: 18px;
            color: #1e40af;
            margin-bottom: 5px;
        }
        .header p {
            font-size: 10px;
            color: #6b7280;
        }
        .section {
            margin-bottom: 20px;
        }
        .section-title {
            background: #2563eb;
            color: white;
            padding: 8px 12px;
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .info-grid {
            display: table;
            width: 100%;
        }
        .info-row {
            display: table-row;
        }
        .info-label {
            display: table-cell;
            padding: 5px 10px;
            background: #f3f4f6;
            font-weight: bold;
            width: 35%;
            border: 1px solid #e5e7eb;
        }
        .info-value {
            display: table-cell;
            padding: 5px 10px;
            border: 1px solid #e5e7eb;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
        }
        th {
            background: #3b82f6;
            color: white;
            padding: 8px 5px;
            text-align: left;
            font-weight: bold;
        }
        td {
            padding: 6px 5px;
            border-bottom: 1px solid #e5e7eb;
        }
        tr:nth-child(even) {
            background: #f9fafb;
        }
        .status-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 9px;
            font-weight: bold;
        }
        .status-paid { background: #dcfce7; color: #166534; }
        .status-unpaid { background: #fee2e2; color: #991b1b; }
        .status-partial { background: #fef3c7; color: #92400e; }
        .status-overdue { background: #fce7f3; color: #9d174d; }
        .status-active { background: #fee2e2; color: #991b1b; }
        .amount {
            text-align: right;
            font-family: monospace;
        }
        .total-row {
            background: #dbeafe !important;
            font-weight: bold;
        }
        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 9px;
            color: #6b7280;
        }
        .no-data {
            text-align: center;
            padding: 15px;
            color: #9ca3af;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Consumer Details Report</h1>
            <p>Generated on {{ $generated_at }}</p>
        </div>

        <div class="section">
            <div class="section-title">Consumer Information</div>
            <div class="info-grid">
                <div class="info-row">
                    <span class="info-label">SC Number</span>
                    <span class="info-value">{{ $consumer->scno }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Name</span>
                    <span class="info-value">{{ $consumer->name }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Phone</span>
                    <span class="info-value">{{ $consumer->phone ?? 'N/A' }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Email</span>
                    <span class="info-value">{{ $consumer->email ?? 'N/A' }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Address</span>
                    <span class="info-value">{{ $address ?: 'N/A' }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Village</span>
                    <span class="info-value">{{ $village }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Feeder</span>
                    <span class="info-value">{{ $feeder }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">DTR</span>
                    <span class="info-value">{{ $dtr }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Category</span>
                    <span class="info-value">{{ $category }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Meter Number</span>
                    <span class="info-value">{{ $consumer->meter_no ?? 'N/A' }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Date of Connection</span>
                    <span class="info-value">{{ $consumer->date_of_connection?->format('Y-m-d') ?? 'N/A' }}</span>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Arrear Summary</div>
            <div class="info-grid">
                <div class="info-row">
                    <span class="info-label">Total Arrear Amount</span>
                    <span class="info-value">₹ {{ number_format($arrear_amount, 2) }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Months Due</span>
                    <span class="info-value">{{ $months_due }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Last Bill Period</span>
                    <span class="info-value">{{ $last_bill_period }}</span>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Monthly Bills (Last 12 Months)</div>
            @if($monthly_bills->count() > 0)
                <table>
                    <thead>
                        <tr>
                            <th>Bill Period</th>
                            <th>Month</th>
                            <th>Year</th>
                            <th class="amount">Billed Units</th>
                            <th class="amount">Billed Amount</th>
                            <th class="amount">Paid Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        @php $totalBilled = 0; $totalPaid = 0; @endphp
                        @foreach($monthly_bills as $bill)
                            @php
                                $totalBilled += $bill->billed_amount;
                                $totalPaid += $bill->paid_amount;
                            @endphp
                            <tr>
                                <td>{{ $bill->bill_period?->format('Y-m-d') ?? 'N/A' }}</td>
                                <td>{{ $bill->bill_month }}</td>
                                <td>{{ $bill->bill_year }}</td>
                                <td class="amount">{{ $bill->billed_units }}</td>
                                <td class="amount">₹ {{ number_format($bill->billed_amount, 2) }}</td>
                                <td class="amount">₹ {{ number_format($bill->paid_amount, 2) }}</td>
                                <td>
                                    <span class="status-badge status-{{ $bill->bill_status }}">
                                        {{ ucfirst($bill->bill_status) }}
                                    </span>
                                </td>
                            </tr>
                        @endforeach
                        <tr class="total-row">
                            <td colspan="4"><strong>Total</strong></td>
                            <td class="amount"><strong>₹ {{ number_format($totalBilled, 2) }}</strong></td>
                            <td class="amount"><strong>₹ {{ number_format($totalPaid, 2) }}</strong></td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
            @else
                <p class="no-data">No billing records found.</p>
            @endif
        </div>

        <div class="section">
            <div class="section-title">Active Defaults</div>
            @if($active_defaults->count() > 0)
                <table>
                    <thead>
                        <tr>
                            <th>Bill Period</th>
                            <th class="amount">Amount Due</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        @php $totalDue = 0; @endphp
                        @foreach($active_defaults as $default)
                            @php $totalDue += $default->amount_due; @endphp
                            <tr>
                                <td>{{ $default->bill_period?->format('Y-m-d') ?? 'N/A' }}</td>
                                <td class="amount">₹ {{ number_format($default->amount_due, 2) }}</td>
                                <td>
                                    <span class="status-badge status-active">{{ ucfirst($default->status) }}</span>
                                </td>
                            </tr>
                        @endforeach
                        <tr class="total-row">
                            <td><strong>Total Due</strong></td>
                            <td class="amount"><strong>₹ {{ number_format($totalDue, 2) }}</strong></td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
            @else
                <p class="no-data">No active defaults.</p>
            @endif
        </div>

        <div class="section">
            <div class="section-title">Recent Visits (Last 5)</div>
            @if($recent_visits->count() > 0)
                <table>
                    <thead>
                        <tr>
                            <th>Visit Date</th>
                            <th>Result</th>
                            <th>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($recent_visits as $visit)
                            <tr>
                                <td>{{ $visit->visit_date?->format('Y-m-d') ?? 'N/A' }}</td>
                                <td>{{ $visit->visit_result ?? 'N/A' }}</td>
                                <td>{{ $visit->remarks ?? '-' }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @else
                <p class="no-data">No recent visits recorded.</p>
            @endif
        </div>

        <div class="section">
            <div class="section-title">Recent Promise to Pay (Last 5)</div>
            @if($recent_promises->count() > 0)
                <table>
                    <thead>
                        <tr>
                            <th>Promise Date</th>
                            <th class="amount">Promised Amount</th>
                            <th>Status</th>
                            <th>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($recent_promises as $promise)
                            <tr>
                                <td>{{ $promise->promise_date?->format('Y-m-d') ?? 'N/A' }}</td>
                                <td class="amount">₹ {{ number_format($promise->promised_amount, 2) }}</td>
                                <td>{{ ucfirst($promise->status ?? 'pending') }}</td>
                                <td>{{ $promise->remarks ?? '-' }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @else
                <p class="no-data">No promise to pay records.</p>
            @endif
        </div>

        <div class="footer">
            <p>This document is system generated. | Consumer SC No: {{ $consumer->scno }} | Generated: {{ $generated_at }}</p>
        </div>
    </div>
</body>
</html>

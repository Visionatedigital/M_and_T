// Grouped Loans View Component
{
    viewMode === "groups" && !location.pathname.includes("/schedule") && (
        <div className="space-y-4">
            {getGroupedLoans().map((group) => {
                const [isExpanded, setIsExpanded] = useState(false);
                const groupProgress = (group.totalPaid / (group.totalPrincipal * 1.3)) * 100;

                return (
                    <Card key={group.groupId}>
                        <CardHeader
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <CardTitle className="text-xl">{group.groupName}</CardTitle>
                                        <Badge variant="secondary">{group.memberCount} Members</Badge>
                                    </div>
                                    <CardDescription className="mt-2 grid grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Total Principal:</span>
                                            <span className="ml-2 font-semibold">UGX {group.totalPrincipal.toLocaleString()}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Total Paid:</span>
                                            <span className="ml-2 font-semibold text-green-600">UGX {group.totalPaid.toLocaleString()}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Remaining:</span>
                                            <span className="ml-2 font-semibold">UGX {group.totalRemaining.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Progress value={groupProgress} className="w-24" />
                                            <span className="text-sm font-medium">{groupProgress.toFixed(0)}%</span>
                                        </div>
                                    </CardDescription>
                                </div>
                                <Button variant="ghost" size="sm">
                                    {isExpanded ? "Collapse" : "Expand"}
                                </Button>
                            </div>
                        </CardHeader>

                        {isExpanded && (
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Member Name</TableHead>
                                            <TableHead>Principal</TableHead>
                                            <TableHead>Total Amount</TableHead>
                                            <TableHead>Paid</TableHead>
                                            <TableHead>Remaining</TableHead>
                                            <TableHead>Progress</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {group.members.map((loan) => {
                                            const progress = (loan.amount_paid / loan.total_amount) * 100;
                                            return (
                                                <TableRow key={loan.id}>
                                                    <TableCell className="font-medium">{loan.full_name}</TableCell>
                                                    <TableCell>UGX {loan.principal.toLocaleString()}</TableCell>
                                                    <TableCell>UGX {loan.total_amount.toLocaleString()}</TableCell>
                                                    <TableCell className="text-green-600">UGX {loan.amount_paid.toLocaleString()}</TableCell>
                                                    <TableCell>UGX {loan.remaining_balance.toLocaleString()}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Progress value={progress} className="w-20" />
                                                            <span className="text-sm text-muted-foreground">{progress.toFixed(0)}%</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => navigate(`/staff-dashboard/loans/details/${loan.id}`)}
                                                        >
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            View
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        )}
                    </Card>
                );
            })}

            {getGroupedLoans().length === 0 && (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        No groups with 2 or more members found
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

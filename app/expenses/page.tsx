import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ExpensesList } from "@/components/expenses/expenses-list";
import { AddExpenseButton } from "@/components/expenses/add-expense-button";
import { ExpensesPagination } from "@/components/expenses/expenses-pagination";
import { ExpensesFilters } from "@/components/expenses/expenses-filters";
import { ExpensesSummary } from "@/components/expenses/expenses-summary";

const ITEMS_PER_PAGE = 20;

export const dynamic = "force-dynamic";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{
    imported?: string;
    page?: string;
    main_category?: string;
    sub_category?: string;
    type?: string;
    assignment?: string;
    merchant?: string;
    date_from?: string;
    date_to?: string;
  }>;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const resolvedSearchParams = await searchParams;
  const currentPage = parseInt(resolvedSearchParams.page || "1");
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  // Check if we have active filters
  const hasActiveFilters = !!(
    resolvedSearchParams.main_category ||
    resolvedSearchParams.sub_category ||
    resolvedSearchParams.type ||
    resolvedSearchParams.assignment ||
    resolvedSearchParams.merchant ||
    resolvedSearchParams.date_from ||
    resolvedSearchParams.date_to
  );

  // Get subcategory IDs if main category is selected (needed for filtering)
  let subcatIds: string[] = [];
  if (
    resolvedSearchParams.main_category &&
    !resolvedSearchParams.sub_category
  ) {
    const { data: subcats } = await supabase
      .from("categories")
      .select("id")
      .eq("parent_id", resolvedSearchParams.main_category);
    subcatIds = subcats?.map((s) => s.id) || [];
  }

  // Get total count and sums for ALL expenses matching filters (across all pages)
  let summaryQuery = supabase
    .from("expenses")
    .select("amount", { count: "exact" })
    .eq("user_id", user.id);

  // Apply filters to summary query
  if (resolvedSearchParams.sub_category) {
    summaryQuery = summaryQuery.eq(
      "category_id",
      resolvedSearchParams.sub_category
    );
  } else if (resolvedSearchParams.main_category) {
    if (subcatIds.length > 0) {
      summaryQuery = summaryQuery.in("category_id", subcatIds);
    } else {
      summaryQuery = summaryQuery.eq("category_id", "impossible-id");
    }
  }

  if (resolvedSearchParams.type === "positive") {
    summaryQuery = summaryQuery.gt("amount", 0);
  } else if (resolvedSearchParams.type === "negative") {
    summaryQuery = summaryQuery.lt("amount", 0);
  }

  if (resolvedSearchParams.assignment === "assigned") {
    summaryQuery = summaryQuery.not("category_id", "is", null);
  } else if (resolvedSearchParams.assignment === "unassigned") {
    summaryQuery = summaryQuery.is("category_id", null);
  }

  // Add merchant filter - case-insensitive partial match
  if (resolvedSearchParams.merchant) {
    summaryQuery = summaryQuery.ilike(
      "merchant",
      `%${resolvedSearchParams.merchant}%`
    );
  }

  // Add date filters
  if (resolvedSearchParams.date_from) {
    summaryQuery = summaryQuery.gte(
      "transaction_date",
      resolvedSearchParams.date_from
    );
  }

  if (resolvedSearchParams.date_to) {
    summaryQuery = summaryQuery.lte(
      "transaction_date",
      resolvedSearchParams.date_to
    );
  }

  const { data: allFilteredExpenses, count: filteredCount } =
    await summaryQuery;

  // Calculate sums
  const totalExpenses =
    allFilteredExpenses
      ?.filter((e) => e.amount < 0)
      .reduce((sum, e) => sum + e.amount, 0) || 0;

  const totalIncome =
    allFilteredExpenses
      ?.filter((e) => e.amount > 0)
      .reduce((sum, e) => sum + e.amount, 0) || 0;

  // Get total count of ALL user expenses (without filters) for comparison
  const { count: totalUserExpenses } = await supabase
    .from("expenses")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const totalCount = filteredCount || 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Get paginated expenses for display
  let expensesQuery = supabase
    .from("expenses")
    .select(
      `
      *,
      category:categories(*)
    `
    )
    .eq("user_id", user.id);

  // Apply same filters to expenses query
  if (resolvedSearchParams.sub_category) {
    expensesQuery = expensesQuery.eq(
      "category_id",
      resolvedSearchParams.sub_category
    );
  } else if (resolvedSearchParams.main_category) {
    if (subcatIds.length > 0) {
      expensesQuery = expensesQuery.in("category_id", subcatIds);
    } else {
      expensesQuery = expensesQuery.eq("category_id", "impossible-id");
    }
  }

  if (resolvedSearchParams.type === "positive") {
    expensesQuery = expensesQuery.gt("amount", 0);
  } else if (resolvedSearchParams.type === "negative") {
    expensesQuery = expensesQuery.lt("amount", 0);
  }

  if (resolvedSearchParams.assignment === "assigned") {
    expensesQuery = expensesQuery.not("category_id", "is", null);
  } else if (resolvedSearchParams.assignment === "unassigned") {
    expensesQuery = expensesQuery.is("category_id", null);
  }

  // Add merchant filter - case-insensitive partial match
  if (resolvedSearchParams.merchant) {
    expensesQuery = expensesQuery.ilike(
      "merchant",
      `%${resolvedSearchParams.merchant}%`
    );
  }

  // Add date filters
  if (resolvedSearchParams.date_from) {
    expensesQuery = expensesQuery.gte(
      "transaction_date",
      resolvedSearchParams.date_from
    );
  }

  if (resolvedSearchParams.date_to) {
    expensesQuery = expensesQuery.lte(
      "transaction_date",
      resolvedSearchParams.date_to
    );
  }

  const { data: expenses, error } = await expensesQuery
    .order("transaction_date", { ascending: false })
    .range(offset, offset + ITEMS_PER_PAGE - 1);

  if (error) throw error;

  // Get unique parent category IDs
  const parentCategoryIds =
    expenses
      ?.map((e) => e.category?.parent_id)
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i) || [];

  // Fetch parent categories separately
  let parentCategories: any[] = [];
  if (parentCategoryIds.length > 0) {
    const { data: parents, error: parentsError } = await supabase
      .from("categories")
      .select("*")
      .in("id", parentCategoryIds);

    if (!parentsError) {
      parentCategories = parents || [];
    }
  }

  // Combine the data
  const expensesWithParents =
    expenses?.map((expense) => ({
      ...expense,
      parent_category: expense.category?.parent_id
        ? parentCategories.find((p) => p.id === expense.category?.parent_id) ||
          null
        : null,
    })) || [];

  const { data: allCategories, error: categoriesError } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id)
    .order("display_order", { ascending: true });

  if (categoriesError) {
    console.error("Error fetching categories:", categoriesError);
  }

  // Log once on server side to verify data
  if (allCategories) {
    console.log(
      "Server: Categories fetched:",
      allCategories.length,
      "categories"
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
            <p className="mt-2 text-gray-600">
              {totalCount} {hasActiveFilters ? "filtered" : "total"} expense
              {totalCount !== 1 ? "s" : ""}
              {totalPages > 0 && ` • Page ${currentPage} of ${totalPages}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/expenses/import"
              className="flex items-center gap-2 rounded-lg border-2 border-blue-600 bg-white px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              Import CSV
            </Link>
            <AddExpenseButton />
          </div>
        </div>

        {/* Success message after import */}
        {resolvedSearchParams.imported === "true" && (
          <div className="mb-6 rounded-lg bg-green-50 p-4">
            <p className="text-sm text-green-800">
              ✅ Expenses imported successfully! You can now categorize them
              below.
            </p>
          </div>
        )}

        {/* Filters */}
        <ExpensesFilters categories={allCategories || []} />

        {/* Summary Cards */}
        <ExpensesSummary
          totalExpenses={totalExpenses}
          totalIncome={totalIncome}
          totalCount={totalUserExpenses || 0}
          filteredCount={totalCount}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Pagination Info */}
        {totalPages > 1 && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{offset + 1}</span> -{" "}
              <span className="font-medium">
                {Math.min(offset + ITEMS_PER_PAGE, totalCount)}
              </span>{" "}
              of <span className="font-medium">{totalCount}</span>
            </p>
            <ExpensesPagination
              currentPage={currentPage}
              totalPages={totalPages}
            />
          </div>
        )}

        {/* Expenses List */}
        <ExpensesList
          key={`page-${currentPage}-${JSON.stringify(resolvedSearchParams)}`}
          expenses={expensesWithParents}
          categories={allCategories || []}
        />

        {/* Bottom Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <ExpensesPagination
              currentPage={currentPage}
              totalPages={totalPages}
            />
          </div>
        )}
      </div>
    </div>
  );
}

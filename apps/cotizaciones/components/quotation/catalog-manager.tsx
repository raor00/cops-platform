"use client"

import { Button } from "@/components/ui/button"
import {
  BulkActionBar,
  CatalogEmptyState,
  CatalogFilters,
  CatalogLayout,
  CatalogSkeleton,
  CatalogToolbar,
  ImagePreviewDialog,
  ProductGrid,
  ProductList,
  QuickViewDrawer,
  useCatalogKeyboard,
} from "@/components/quotation/catalog"
import { CatalogPagination } from "@/components/quotation/catalog/catalog-pagination"
import { CatalogSelectionSummary } from "@/components/quotation/catalog/catalog-selection-summary"
import {
  BulkCategoryDialog,
  CreateEditCatalogItemDialog,
  DeleteCatalogItemDialog,
  DiscountConfigDialog,
  PriceAdjustmentDialog,
} from "@/components/quotation/catalog/catalog-manager-dialogs"
import { useCatalogManager } from "@/components/quotation/catalog/use-catalog-manager"
import { BrandManagerDialog } from "@/components/quotation/catalog/brand-manager-dialog"
import { RefreshCcw, Settings2, Tags, Tag } from "lucide-react"
import { toast } from "sonner"

export function CatalogManager() {
  const { state, derived, actions } = useCatalogManager()

  useCatalogKeyboard({
    items: derived.paginated,
    selectedId: state.activeItemId,
    onSelect: actions.setActiveItemId,
    onQuickView: (id) => {
      const item = derived.paginated.find((entry) => entry.id === id)
      if (item) actions.setQuickViewItem(item)
    },
    onEdit: (id) => {
      const item = derived.paginated.find((entry) => entry.id === id)
      if (item) actions.openEdit(item)
    },
    onDelete: actions.setDeleteConfirmId,
    onSearchFocus: () => {
      const searchInput = document.querySelector<HTMLInputElement>('input[placeholder="Buscar por código o descripción"]')
      searchInput?.focus()
    },
    onClearSelection: actions.clearSelection,
    onEscape: () => actions.setQuickViewItem(null),
  })

  return (
    <div className="space-y-4">
      <div className="page-header">
        <div className="min-w-0">
          <h1 className="page-title truncate">Catálogo de Productos</h1>
          <p className="page-description">
            {derived.counts.all} productos · {derived.counts.ablerex} Ablerex
          </p>
        </div>

        <div className="page-actions flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => actions.setBrandDialogOpen(true)}>
            <Tag className="h-4 w-4" />
            Marcas
          </Button>
          <Button variant="outline" size="sm" onClick={() => actions.setDiscountDialogOpen(true)}>
            <Tags className="h-4 w-4" />
            Descuento global
          </Button>
          <Button variant="outline" size="sm" onClick={() => actions.setPriceDialogOpen(true)}>
            <Settings2 className="h-4 w-4" />
            Ajuste de precios
          </Button>
          <Button variant="outline" size="sm" onClick={actions.syncAblerexCatalog}>
            <RefreshCcw className="h-4 w-4" />
            Sync Ablerex
          </Button>
        </div>
      </div>

      <CatalogLayout
        sidebar={
          <CatalogFilters
            categories={derived.categories}
            selectedCategory={state.selectedCategory}
            onCategoryChange={actions.setSelectedCategory}
            subcategories={derived.sidebarSubcategoryOptions}
            selectedSubcategory={state.selectedSubcategory}
            onSubcategoryChange={actions.setSelectedSubcategory}
            brands={derived.brands}
            selectedBrands={state.selectedBrands}
            onBrandsChange={actions.setSelectedBrands}
            priceRange={derived.priceBounds}
            selectedPriceRange={state.priceRange}
            onPriceRangeChange={actions.setPriceRange}
            stockFilter={state.stockFilter}
            onStockFilterChange={actions.setStockFilter}
            onClearAll={actions.resetFilters}
            hasActiveFilters={derived.hasActiveFilters}
          />
        }
      >
        <div className="space-y-4">
          <CatalogToolbar
            search={state.search}
            onSearchChange={actions.setSearch}
            sort={state.sort}
            onSortChange={actions.setSort}
            view={state.view}
            onViewChange={actions.setView}
            onNewClick={actions.openCreate}
            activeFilters={derived.activeFilters}
            resultCount={derived.filteredCount}
          />

          <CatalogSelectionSummary
            allPageSelected={derived.allPageSelected}
            onTogglePageSelection={actions.toggleSelectAllPage}
            selectedCount={state.selectedIds.length}
            filteredCount={derived.filteredCount}
            pageStart={derived.pageStart}
            pageEnd={derived.pageEnd}
          />

          {state.loading ? <CatalogSkeleton view={state.view} /> : null}

          {!state.loading && derived.paginated.length === 0 ? (
            <CatalogEmptyState hasFilters={derived.hasActiveFilters} onClearFilters={actions.resetFilters} />
          ) : null}

          {!state.loading && derived.paginated.length > 0 ? (
            <div className="space-y-4">
              {state.view === "grid" ? (
                <ProductGrid
                  items={derived.paginated}
                  selectedIds={state.selectedIds}
                  onSelect={actions.toggleSelected}
                  onQuickView={actions.setQuickViewItem}
                  onEdit={actions.openEdit}
                  onDelete={(item) => actions.setDeleteConfirmId(item.id)}
                  getEffectivePrice={actions.getEffectivePrice}
                />
              ) : (
                <ProductList
                  items={derived.paginated}
                  selectedIds={state.selectedIds}
                  onSelect={actions.toggleSelected}
                  onQuickView={actions.setQuickViewItem}
                  onEdit={actions.openEdit}
                  onDelete={(item) => actions.setDeleteConfirmId(item.id)}
                  getEffectivePrice={actions.getEffectivePrice}
                  sortBy={derived.listSortState.sortBy}
                  sortDirection={derived.listSortState.direction}
                  onSort={(column, direction) => {
                    const mappedSort = actions.mapListSortToToolbarSort(column, direction)
                    if (mappedSort) actions.setSort(mappedSort)
                  }}
                />
              )}

              <CatalogPagination page={state.page} totalPages={derived.totalPages} onPageChange={actions.setPage} />
            </div>
          ) : null}
        </div>

        <BulkActionBar
          selectedCount={state.selectedIds.length}
          totalCount={derived.filteredCount}
          onSelectAll={actions.selectAllResults}
          onClearSelection={actions.clearSelection}
          onAdjustPrices={() => actions.setPriceDialogOpen(true)}
          onChangeCategory={actions.openBulkCategoryDialog}
          onDelete={actions.deleteSelection}
        />
      </CatalogLayout>

      <QuickViewDrawer
        item={derived.currentQuickViewItem}
        open={Boolean(derived.currentQuickViewItem)}
        onOpenChange={(open) => !open && actions.setQuickViewItem(null)}
        onEdit={() => derived.currentQuickViewItem && actions.openEdit(derived.currentQuickViewItem)}
        onDuplicate={() => derived.currentQuickViewItem && actions.duplicateItem(derived.currentQuickViewItem)}
        onDelete={() => derived.currentQuickViewItem && actions.setDeleteConfirmId(derived.currentQuickViewItem.id)}
        onAddToQuotation={() => toast.info("La acción de agregar a cotización se gestiona desde el constructor de cotizaciones")}
        onPreviewImage={() => derived.currentQuickViewItem && actions.openImagePreview(derived.currentQuickViewItem)}
        effectivePrice={derived.currentQuickViewItem ? actions.getEffectivePrice(derived.currentQuickViewItem) : undefined}
      />

      <ImagePreviewDialog
        src={state.previewImage?.src}
        alt={state.previewImage ? `${state.previewImage.code} · ${state.previewImage.description}` : "Vista previa del producto"}
        open={Boolean(state.previewImage)}
        onOpenChange={(open) => !open && actions.setPreviewImage(null)}
      />

      <CreateEditCatalogItemDialog
        open={state.dialogOpen}
        onOpenChange={actions.setDialogOpen}
        editingItem={state.editingItem}
        form={state.form}
        onFormChange={(updater) => actions.setForm((current) => updater(current))}
        categoryOptions={derived.categoryOptions}
        subcategoryOptions={derived.subcategoryOptions}
        brandOptions={state.registeredBrands}
        onSave={actions.saveItem}
        onManageBrands={() => actions.setBrandDialogOpen(true)}
        onPreviewImage={(src, alt) => actions.openImagePreview(src ? { src, code: state.form.code || alt, description: state.form.description || alt } : null)}
      />

      <DeleteCatalogItemDialog
        open={Boolean(state.deleteConfirmId)}
        onOpenChange={(open) => !open && actions.setDeleteConfirmId(null)}
        onConfirm={() => state.deleteConfirmId && actions.deleteItem(state.deleteConfirmId)}
      />

      <PriceAdjustmentDialog
        open={state.priceDialogOpen}
        onOpenChange={actions.setPriceDialogOpen}
        priceAction={state.priceAction}
        onPriceActionChange={actions.setPriceAction}
        priceMode={state.priceMode}
        onPriceModeChange={actions.setPriceMode}
        priceScope={state.priceScope}
        onPriceScopeChange={actions.setPriceScope}
        priceValue={state.priceValue}
        onPriceValueChange={actions.setPriceValue}
        priceCategory={state.priceCategory}
        onPriceCategoryChange={actions.setPriceCategory}
        categoryOptions={derived.categoryOptions}
        onApply={actions.applyMassivePriceAdjustment}
      />

      <DiscountConfigDialog
        open={state.discountDialogOpen}
        onOpenChange={actions.setDiscountDialogOpen}
        discountConfig={state.discountConfig}
        onDiscountConfigChange={(updater) => actions.setDiscountConfig((current) => updater(current))}
        categoryOptions={derived.categoryOptions}
        subcategoryOptions={derived.discountSubcategoryOptions}
        onSave={actions.saveDiscount}
      />

      <BulkCategoryDialog
        open={state.bulkCategoryOpen}
        onOpenChange={actions.setBulkCategoryOpen}
        category={state.bulkCategory}
        onCategoryChange={actions.setBulkCategory}
        subcategory={state.bulkSubcategory}
        onSubcategoryChange={actions.setBulkSubcategory}
        categoryOptions={derived.categoryOptions}
        subcategoryOptions={derived.bulkSubcategoryOptions}
        onApply={actions.applyBulkCategoryChange}
      />

      <BrandManagerDialog
        open={state.brandDialogOpen}
        onOpenChange={actions.setBrandDialogOpen}
        brands={state.registeredBrands}
        onBrandsChange={actions.setRegisteredBrands}
      />
    </div>
  )
}

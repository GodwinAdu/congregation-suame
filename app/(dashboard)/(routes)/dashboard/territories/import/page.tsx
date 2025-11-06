import { requirePermission } from '@/lib/helpers/server-permission-check'
import { KMLImporter } from '../_components/kml-importer'

export default async function TerritoryImportPage() {
  await requirePermission('territoryImport')
  
  return <KMLImporter />
}
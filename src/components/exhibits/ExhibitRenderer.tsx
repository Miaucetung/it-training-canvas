import type { ExhibitData } from "@/types/exhibit";
import { CLIExhibit } from "./CLIExhibit";
import { TopologyExhibit } from "./TopologyExhibit";
import { TableExhibit } from "./TableExhibit";
import { WirelessZonesExhibit } from "./WirelessZonesExhibit";

export function ExhibitRenderer({ exhibit }: { exhibit: ExhibitData }) {
  switch (exhibit.type) {
    case "cli":
      return <CLIExhibit exhibit={exhibit} />;
    case "topology":
      return <TopologyExhibit exhibit={exhibit} />;
    case "table":
      return <TableExhibit exhibit={exhibit} />;
    case "wireless-zones":
      return <WirelessZonesExhibit exhibit={exhibit} />;
    case "none":
      return null;
  }
}

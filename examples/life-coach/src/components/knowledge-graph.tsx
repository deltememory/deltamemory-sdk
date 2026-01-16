"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { User } from "@/lib/users";

interface GraphNode {
  id: string;
  name: string;
  node_type: "concept" | "fact";
  salience?: number;
}

interface GraphEdge {
  from: string;
  to: string;
  relation_type: string;
  weight: number;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  node_type: "concept" | "fact";
  salience?: number;
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  type: string;
  weight: number;
}

interface KnowledgeGraphProps {
  user: User;
}

export function KnowledgeGraph({ user }: KnowledgeGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [data, setData] = useState<GraphData>({ nodes: [], edges: [] });

  useEffect(() => {
    const fetchGraph = async () => {
      const res = await fetch(`/api/graph?userId=${user.id}`);
      const graph = await res.json();
      setData(graph);
    };
    fetchGraph();
    const interval = setInterval(fetchGraph, 5000);
    return () => clearInterval(interval);
  }, [user.id]);

  useEffect(() => {
    if (!svgRef.current || data.nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const g = svg.append("g");

    svg.call(
      d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.3, 3])
        .on("zoom", (event) => g.attr("transform", event.transform))
    );

    const nodes: SimNode[] = data.nodes.map((n) => ({ ...n }));
    const links: SimLink[] = data.edges.map((e) => ({
      source: e.from,
      target: e.to,
      type: e.relation_type,
      weight: e.weight,
    }));

    const simulation = d3
      .forceSimulation<SimNode>(nodes)
      .force("link", d3.forceLink<SimNode, SimLink>(links).id((d) => d.id).distance(60))
      .force("charge", d3.forceManyBody().strength(-120))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(25));

    const link = g
      .append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "var(--border)")
      .attr("stroke-width", (d) => Math.max(1, d.weight * 2))
      .attr("stroke-opacity", 0.6);

    const node = g
      .append("g")
      .selectAll<SVGGElement, SimNode>("g")
      .data(nodes)
      .join("g")
      .call(
        d3.drag<SVGGElement, SimNode>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    node
      .append("circle")
      .attr("r", (d) => (d.node_type === "concept" ? 8 : 5))
      .attr("fill", (d) => (d.node_type === "concept" ? "var(--accent)" : "var(--text-muted)"))
      .attr("stroke", "var(--bg)")
      .attr("stroke-width", 1.5);

    node
      .append("text")
      .text((d) => d.name.length > 12 ? d.name.slice(0, 12) + "…" : d.name)
      .attr("x", 12)
      .attr("y", 4)
      .attr("font-size", "10px")
      .attr("fill", "var(--text-muted)");

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as SimNode).x!)
        .attr("y1", (d) => (d.source as SimNode).y!)
        .attr("x2", (d) => (d.target as SimNode).x!)
        .attr("y2", (d) => (d.target as SimNode).y!);

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [data]);

  return (
    <div className="border border-[var(--border)] rounded-lg h-full flex flex-col">
      <div className="px-3 py-2 border-b border-[var(--border)]">
        <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
          Knowledge Graph
        </span>
        <span className="ml-2 text-xs text-[var(--text-muted)]">
          {data.nodes.length} nodes · {data.edges.length} edges
        </span>
      </div>
      <div className="flex-1 relative">
        {data.nodes.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-[var(--text-muted)] text-sm">
            No memories yet
          </div>
        ) : (
          <svg ref={svgRef} className="w-full h-full" />
        )}
      </div>
    </div>
  );
}
